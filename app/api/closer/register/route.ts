import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCloser = await prisma.closer.findUnique({
      where: { email }
    });

    if (existingCloser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create closer account
    const closer = await prisma.closer.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        isActive: true,
        isApproved: false, // Requires admin approval
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
      }
    });

    // Create audit log
    await prisma.closerAuditLog.create({
      data: {
        closerId: closer.id,
        action: 'registered',
        details: {
          email: closer.email,
          name: closer.name,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    console.log('✅ Closer registered successfully:', {
      id: closer.id,
      name: closer.name,
      email: closer.email,
      isApproved: closer.isApproved
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please wait for admin approval.',
      closer
    });

  } catch (error) {
    console.error('❌ Error registering closer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
