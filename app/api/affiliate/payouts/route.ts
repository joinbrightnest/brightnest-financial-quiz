import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("Affiliate payouts API called");
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.affiliateId) {
      return NextResponse.json(
        { error: "Invalid token: missing affiliateId" },
        { status: 401 }
      );
    }

    // Get affiliate with payouts and conversions
    console.log("Fetching affiliate:", decoded.affiliateId);
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: decoded.affiliateId },
      include: {
        payouts: {
          orderBy: { createdAt: "desc" },
        },
        conversions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    console.log("Affiliate found:", !!affiliate);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Get commission hold period from settings
    const settingsResult = await prisma.$queryRaw`
      SELECT value FROM "Settings" WHERE key = 'commission_hold_days'
    ` as any[];
    
    const holdDays = settingsResult.length > 0 ? parseInt(settingsResult[0].value) : 30;

    // Calculate commission hold information
    // Check if commissionStatus field exists, if not treat all as available
    const hasCommissionStatusField = affiliate.conversions.some(c => c.commissionStatus !== undefined);
    
    let heldCommissions: any[], availableCommissions: any[], heldAmount: number, availableAmount: number;
    
    if (hasCommissionStatusField) {
      // New system: filter by commission status AND only include actual commissions
      heldCommissions = affiliate.conversions.filter(c => 
        c.commissionStatus === 'held' && Number(c.commissionAmount) > 0
      );
      availableCommissions = affiliate.conversions.filter(c => 
        (c.commissionStatus === 'available' || 
         c.commissionStatus === null || 
         c.commissionStatus === undefined) &&
        Number(c.commissionAmount) > 0
      );
      heldAmount = heldCommissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
      availableAmount = availableCommissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    } else {
      // Legacy system: treat all conversions as available, but only include actual commissions
      heldCommissions = [];
      availableCommissions = affiliate.conversions.filter(c => Number(c.commissionAmount) > 0);
      heldAmount = 0;
      availableAmount = availableCommissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    }
    
    // Calculate total paid and earned first
    const totalPaid = affiliate.payouts
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    const pendingPayouts = affiliate.payouts
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amountDue), 0);

    const totalEarned = Number(affiliate.totalCommission || 0);
    
    // Calculate the actual available commission (total earned - paid out)
    const actualAvailableCommission = totalEarned - totalPaid;
    
    // Calculate days until release for held commissions
    let commissionsWithHoldInfo: any[] = [];
    try {
      commissionsWithHoldInfo = heldCommissions.map(conversion => {
        const holdUntil = new Date(conversion.createdAt);
        holdUntil.setDate(holdUntil.getDate() + holdDays);
        const now = new Date();
        const daysLeft = Math.max(0, Math.ceil((holdUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        return {
          id: conversion.id,
          amount: Number(conversion.commissionAmount),
          createdAt: conversion.createdAt,
          holdUntil: holdUntil.toISOString(),
          daysLeft,
          isReadyForRelease: daysLeft === 0
        };
      });
    } catch (error) {
      console.error('Error calculating commission hold info:', error);
      commissionsWithHoldInfo = [];
    }

    // Calculate payout summary

    return NextResponse.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          totalCommission: Number(affiliate.totalCommission || 0),
          totalEarned,
          totalPaid,
          pendingPayouts,
          availableCommission: actualAvailableCommission,
          payoutMethod: affiliate.payoutMethod || "stripe",
        },
        payouts: affiliate.payouts.map(payout => ({
          id: payout.id,
          amountDue: Number(payout.amountDue),
          status: payout.status,
          notes: payout.notes,
          createdAt: payout.createdAt,
          paidAt: payout.paidAt,
        })),
        summary: {
          totalEarned,
          totalPaid,
          pendingPayouts,
          availableCommission: actualAvailableCommission,
          heldCommission: heldAmount,
          holdDays,
        },
        commissionHoldInfo: {
          heldCommissions: commissionsWithHoldInfo,
          totalHeldAmount: heldAmount,
          totalAvailableAmount: availableAmount,
          holdDays,
          readyForRelease: commissionsWithHoldInfo.filter(c => c.isReadyForRelease).length,
          existingCommissions: availableCommissions.length, // Count of existing commissions treated as available
        }
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error fetching affiliate payouts:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch affiliate payouts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
