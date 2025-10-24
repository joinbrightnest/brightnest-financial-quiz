import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory cache to prevent duplicate requests within 30 seconds
const requestCache = new Map<string, number>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Clean up expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of requestCache.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      requestCache.delete(key);
    }
  }
}, CACHE_DURATION);

export async function POST(request: NextRequest) {
  try {
    // Get client IP and user agent for tracking
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    
    // Ignore bots, crawlers, and deployment checks
    const botPatterns = /bot|crawler|spider|prerender|vercel|headless|lighthouse/i;
    if (botPatterns.test(userAgent)) {
      console.log("🤖 Bot/crawler detected, skipping click tracking");
      return NextResponse.json({ success: true, bot: true });
    }
    
    // Create a fingerprint for duplicate detection
    const fingerprint = `normal-${ipAddress}-${userAgent}`;
    
    // Check in-memory cache first (fastest duplicate detection)
    const now = Date.now();
    const cachedTime = requestCache.get(fingerprint);
    if (cachedTime && (now - cachedTime) < CACHE_DURATION) {
      console.log("🚫 Duplicate normal website click blocked by cache");
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Check if we already tracked this browser recently (within 2 minutes) to avoid duplicate clicks
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const existingClick = await prisma.normalWebsiteClick.findFirst({
      where: {
        ipAddress: ipAddress,
        userAgent: userAgent,
        createdAt: {
          gte: twoMinutesAgo
        }
      }
    });

    if (existingClick) {
      console.log("🔄 Duplicate normal website click detected, skipping");
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Record the click in a transaction
    try {
      await prisma.$transaction(async (tx) => {
        // Double-check for duplicates within the transaction
        const duplicateCheck = await tx.normalWebsiteClick.findFirst({
          where: {
            ipAddress: ipAddress,
            userAgent: userAgent,
            createdAt: {
              gte: twoMinutesAgo
            }
          }
        });

        if (!duplicateCheck) {
          // Record the click
          await tx.normalWebsiteClick.create({
            data: {
              ipAddress,
              userAgent,
            },
          });

          // Update cache to prevent future duplicates
          requestCache.set(fingerprint, now);
          
          console.log("✅ Normal website click recorded successfully");
        } else {
          console.log("🔄 Duplicate click detected within transaction, skipping");
        }
      });
    } catch (transactionError) {
      console.error("Error in normal website click transaction:", transactionError);
      return NextResponse.json(
        { success: false, error: "Failed to record click" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking normal website click:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track click" },
      { status: 500 }
    );
  }
}

