import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function GET() {
  try {
    const payouts = await prisma.affiliatePayout.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
            referralCode: true,
          },
        },
      },
      take: 200,
    });

    const totalAmount = payouts.reduce((sum, p) => sum + Number(p.amountDue), 0);
    const totalCount = payouts.length;

    const completed = payouts.filter((p) => p.status === "completed");
    const pending = payouts.filter((p) => p.status === "pending" || p.status === "processing");

    const summary = {
      totalAmount,
      totalCount,
      completedAmount: completed.reduce((s, p) => s + Number(p.amountDue), 0),
      completedCount: completed.length,
      pendingAmount: pending.reduce((s, p) => s + Number(p.amountDue), 0),
      pendingCount: pending.length,
    };

    return NextResponse.json({
      data: {
        payouts: payouts.map((p) => ({
          id: p.id,
          amountDue: Number(p.amountDue),
          status: p.status,
          paidAt: p.paidAt ? p.paidAt.toISOString() : null,
          notes: p.notes,
          createdAt: p.createdAt.toISOString(),
          affiliate: p.affiliate,
        })),
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}
