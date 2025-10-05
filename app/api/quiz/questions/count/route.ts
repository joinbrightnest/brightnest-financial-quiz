import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.quizQuestion.count({
      where: { active: true },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching question count:", error);
    return NextResponse.json(
      { error: "Failed to fetch question count" },
      { status: 500 }
    );
  }
}
