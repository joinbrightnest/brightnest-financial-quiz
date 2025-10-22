import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function GET() {
  try {
    const affiliates = await prisma.affiliate.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        totalCommission: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (affiliates.length === 0) {
      return NextResponse.json({ affiliates: [] });
    }

    const affiliateIds = affiliates.map((a) => a.id);

    const [paidAgg, pendingAgg] = await Promise.all([
      prisma.affiliatePayout.groupBy({
        by: ["affiliateId"],
        where: { affiliateId: { in: affiliateIds }, status: "completed" },
        _sum: { amountDue: true },
      }),
      prisma.affiliatePayout.groupBy({
        by: ["affiliateId"],
        where: { affiliateId: { in: affiliateIds }, status: { in: ["pending", "processing"] } },
        _sum: { amountDue: true },
      }),
    ]);

    const paidMap = new Map<string, number>();
    for (const row of paidAgg) {
      const amt = Number(row._sum.amountDue || 0);
      paidMap.set(row.affiliateId, amt);
    }

    const pendingMap = new Map<string, number>();
    for (const row of pendingAgg) {
      const amt = Number(row._sum.amountDue || 0);
      pendingMap.set(row.affiliateId, amt);
    }

    const result = affiliates.map((a) => {
      const totalCommission = Number(a.totalCommission || 0);
      const totalPaid = paidMap.get(a.id) || 0;
      const pendingPayouts = pendingMap.get(a.id) || 0;
      const availableCommission = Math.max(totalCommission - totalPaid - pendingPayouts, 0);

      return {
        id: a.id,
        name: a.name,
        email: a.email,
        referralCode: a.referralCode,
        totalCommission,
        totalPaid,
        pendingPayouts,
        availableCommission,
      };
    });

    return NextResponse.json({ affiliates: result });
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliates" },
      { status: 500 }
    );
  }
}
