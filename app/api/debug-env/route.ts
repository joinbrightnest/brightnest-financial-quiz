import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    databaseUrlStart: process.env.DATABASE_URL?.substring(0, 20) || "NOT_SET",
    nodeEnv: process.env.NODE_ENV,
  });
}

