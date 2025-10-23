import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Process commission releases (move from held to available)
export async function POST(request: NextRequest) {
  try {
    // Get commission hold period from settings
    const settingsResult = await prisma.$queryRaw`
      SELECT value FROM "Settings" WHERE key = 'commission_hold_days'
    ` as any[];
    
    const holdDays = settingsResult.length > 0 ? parseInt(settingsResult[0].value) : 30;
    
    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - holdDays);
    
    // Find all conversions that should be released from hold
    const conversionsToRelease = await prisma.affiliateConversion.findMany({
      where: {
        commissionStatus: 'held',
        createdAt: {
          lte: cutoffDate
        }
      },
      include: {
        affiliate: true
      }
    });
    
    if (conversionsToRelease.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No commissions ready for release',
        releasedCount: 0,
        releasedAmount: 0
      });
    }
    
    // Update conversions to available status
    const updateResult = await prisma.affiliateConversion.updateMany({
      where: {
        id: {
          in: conversionsToRelease.map(c => c.id)
        }
      },
      data: {
        commissionStatus: 'available',
        releasedAt: new Date()
      }
    });
    
    // Calculate total released amount
    const totalReleasedAmount = conversionsToRelease.reduce((sum, conversion) => {
      return sum + parseFloat(conversion.commissionAmount.toString());
    }, 0);
    
    // Update affiliate total commission (add to available)
    for (const conversion of conversionsToRelease) {
      await prisma.affiliate.update({
        where: { id: conversion.affiliateId },
        data: {
          totalCommission: {
            increment: conversion.commissionAmount
          }
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully released ${updateResult.count} commissions`,
      releasedCount: updateResult.count,
      releasedAmount: totalReleasedAmount,
      cutoffDate: cutoffDate.toISOString(),
      holdDays
    });
    
  } catch (error) {
    console.error('Error processing commission releases:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process commission releases'
    }, { status: 500 });
  }
}

// GET - Get commission release status
export async function GET() {
  try {
    // Get commission hold period from settings
    const settingsResult = await prisma.$queryRaw`
      SELECT value FROM "Settings" WHERE key = 'commission_hold_days'
    ` as any[];
    
    const holdDays = settingsResult.length > 0 ? parseInt(settingsResult[0].value) : 30;
    
    // Calculate the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - holdDays);
    
    // Count commissions ready for release
    const readyForRelease = await prisma.affiliateConversion.count({
      where: {
        commissionStatus: 'held',
        createdAt: {
          lte: cutoffDate
        }
      }
    });
    
    // Count total held commissions
    const totalHeld = await prisma.affiliateConversion.count({
      where: {
        commissionStatus: 'held'
      }
    });
    
    // Count total available commissions
    const totalAvailable = await prisma.affiliateConversion.count({
      where: {
        commissionStatus: 'available'
      }
    });
    
    // Calculate total amounts
    const heldAmount = await prisma.affiliateConversion.aggregate({
      where: {
        commissionStatus: 'held'
      },
      _sum: {
        commissionAmount: true
      }
    });
    
    const availableAmount = await prisma.affiliateConversion.aggregate({
      where: {
        commissionStatus: 'available'
      },
      _sum: {
        commissionAmount: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        holdDays,
        cutoffDate: cutoffDate.toISOString(),
        readyForRelease,
        totalHeld,
        totalAvailable,
        heldAmount: parseFloat(heldAmount._sum.commissionAmount?.toString() || '0'),
        availableAmount: parseFloat(availableAmount._sum.commissionAmount?.toString() || '0')
      }
    });
    
  } catch (error) {
    console.error('Error fetching commission release status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch commission release status'
    }, { status: 500 });
  }
}
