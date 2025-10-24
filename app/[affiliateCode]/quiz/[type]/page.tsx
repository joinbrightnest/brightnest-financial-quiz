import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AffiliateQuizPageProps {
  params: Promise<{ affiliateCode: string; type: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function validateAffiliate(affiliateCode: string) {
  try {
    console.log("🎯 Server-side affiliate quiz validation:", {
      affiliateCode
    });

    // Find affiliate by referral code
    let affiliate = null;
    try {
      affiliate = await prisma.affiliate.findUnique({
        where: { referralCode: affiliateCode },
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return false;
    }

    if (affiliate) {
      // Check if this affiliate has a custom tracking link
      if ((affiliate as any).customTrackingLink) {
        console.log("❌ Referral code link permanently disabled - affiliate has custom tracking link:", {
          referralCode: affiliateCode,
          customTrackingLink: (affiliate as any).customTrackingLink
        });
        return false;
      }

      console.log("✅ Valid affiliate found for quiz:", {
        id: affiliate.id,
        name: affiliate.name,
        referralCode: affiliate.referralCode,
        isApproved: affiliate.isApproved,
        isActive: affiliate.isActive
      });

      // Note: Click tracking is handled by the main affiliate page to avoid duplicates
      return true;
    } else {
      console.log("❌ Affiliate not found for quiz code:", affiliateCode);
      return false;
    }
  } catch (error) {
    console.error("❌ Error validating affiliate for quiz:", error);
    return false;
  }
}

export default async function AffiliateQuizPage({ params, searchParams }: AffiliateQuizPageProps) {
  const { affiliateCode, type } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate affiliate server-side (no tracking - handled by main affiliate page)
  const isValidAffiliate = await validateAffiliate(affiliateCode);

  // If not a valid affiliate, redirect to 404
  if (!isValidAffiliate) {
    return (
      <html>
        <head>
          <script dangerouslySetInnerHTML={{
            __html: `window.location.replace('/404');`
          }} />
        </head>
        <body></body>
      </html>
    );
  }

  // IMMEDIATE JavaScript redirect to quiz with affiliate parameter
  // This is the fastest possible redirect method
  return (
    <html>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `window.location.replace('/quiz/${type}?affiliate=${affiliateCode}');`
        }} />
      </head>
      <body></body>
    </html>
  );
}
