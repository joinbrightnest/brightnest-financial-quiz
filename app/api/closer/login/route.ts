import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find closer by email
    const closer = await prisma.closer.findUnique({
      where: { email }
    });

    if (!closer) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if closer is active
    if (!closer.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 401 }
      );
    }

    // Check if closer is approved
    if (!closer.isApproved) {
      return NextResponse.json(
        { error: 'Account pending approval. Please wait for admin approval.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, closer.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        closerId: closer.id, 
        email: closer.email,
        role: 'closer'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create audit log
    await prisma.closerAuditLog.create({
      data: {
        closerId: closer.id,
        action: 'login',
        details: {
          email: closer.email,
          loginTime: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    console.log('✅ Closer logged in successfully:', {
      id: closer.id,
      name: closer.name,
      email: closer.email
    });

    return NextResponse.json({
      success: true,
      token,
      closer: {
        id: closer.id,
        name: closer.name,
        email: closer.email,
        phone: closer.phone,
        isActive: closer.isActive,
        isApproved: closer.isApproved,
        totalCalls: closer.totalCalls || 0,
        totalConversions: closer.totalConversions || 0,
        totalRevenue: closer.totalRevenue || 0,
        conversionRate: closer.conversionRate || 0,
        createdAt: closer.createdAt,
      }
    });

  } catch (error) {
    console.error('❌ Error logging in closer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
