import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get("admin_authenticated");
  return cookie?.value === "true";
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: affiliateId } = await params;
    const body = await request.json();
    const amount = Number(body.amount);
    const notes: string | undefined = body.notes || undefined;
    const status: "pending" | "processing" | "completed" | "failed" = body.status || "completed";

    if (!affiliateId) {
      return NextResponse.json({ error: "Missing affiliate id" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    const affiliate = await prisma.affiliate.findUnique({ where: { id: affiliateId } });
    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    // Compute available commission
    const [paidAgg, pendingAgg] = await Promise.all([
      prisma.affiliatePayout.aggregate({
        _sum: { amountDue: true },
        where: { affiliateId, status: "completed" },
      }),
      prisma.affiliatePayout.aggregate({
        _sum: { amountDue: true },
        where: { affiliateId, status: { in: ["pending", "processing"] } },
      }),
    ]);

    const totalCommission = Number(affiliate.totalCommission || 0);
    const totalPaid = Number(paidAgg._sum.amountDue || 0);
    const totalPending = Number(pendingAgg._sum.amountDue || 0);
    const available = Math.max(totalCommission - totalPaid - totalPending, 0);

    if (amount > available) {
      return NextResponse.json({ error: "Amount exceeds available commission" }, { status: 400 });
    }

    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateId,
        amountDue: amount,
        status,
        paidAt: status === "completed" ? new Date() : null,
        notes,
      },
      include: {
        affiliate: {
          select: { id: true, name: true, email: true, referralCode: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amountDue: Number(payout.amountDue),
        status: payout.status,
        paidAt: payout.paidAt ? payout.paidAt.toISOString() : null,
        notes: payout.notes,
        createdAt: payout.createdAt.toISOString(),
        affiliate: payout.affiliate,
      },
    });
  } catch (error) {
    console.error("Error creating payout:", error);
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 });
  }
}
