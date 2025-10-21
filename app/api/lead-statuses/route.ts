import { NextRequest, NextResponse } from "next/server";
import { getLeadStatuses } from "@/lib/lead-status";

export async function POST(request: NextRequest) {
  try {
    const { sessionIds } = await request.json();
    
    if (!sessionIds || !Array.isArray(sessionIds)) {
      return NextResponse.json(
        { error: "sessionIds array is required" },
        { status: 400 }
      );
    }
    
    console.log('🔍 API: Getting lead statuses for sessionIds:', sessionIds);
    const statuses = await getLeadStatuses(sessionIds);
    console.log('✅ API: Lead statuses loaded:', statuses);
    
    return NextResponse.json({
      success: true,
      statuses
    });
  } catch (error) {
    console.error("❌ API: Error getting lead statuses:", error);
    return NextResponse.json(
      { 
        error: "Failed to get lead statuses", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
