import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuizPage from "../../../quiz/[type]/page";

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

  // Validate affiliate server-side
  const isValidAffiliate = await validateAffiliate(affiliateCode);

  // If not a valid affiliate, show 404
  if (!isValidAffiliate) {
    notFound();
  }

  // Render the quiz page directly with the affiliate code override
  // This eliminates the redirect and provides an instant experience
  // The URL remains /affiliateCode/quiz/type

  // We need to construct params object that matches what QuizPage expects
  // Since QuizPage expects params to be a Promise, we wrap our object
  const quizPageParams = Promise.resolve({ type });

  return (
    <QuizPage
      params={quizPageParams}
      affiliateCodeOverride={affiliateCode}
    />
  );
}
