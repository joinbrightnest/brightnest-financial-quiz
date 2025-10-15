import { notFound } from "next/navigation";
import SharedHomePage from "../../components/SharedHomePage";

interface AffiliatePageProps {
  params: Promise<{ affiliateCode: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function validateAffiliate(affiliateCode: string, searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const utm_source = typeof searchParams.utm_source === 'string' ? searchParams.utm_source : undefined;
    const utm_medium = typeof searchParams.utm_medium === 'string' ? searchParams.utm_medium : undefined;
    const utm_campaign = typeof searchParams.utm_campaign === 'string' ? searchParams.utm_campaign : undefined;

    // Build query string for validation API
    const queryParams = new URLSearchParams();
    queryParams.set('code', affiliateCode);
    if (utm_source) queryParams.set('utm_source', utm_source);
    if (utm_medium) queryParams.set('utm_medium', utm_medium);
    if (utm_campaign) queryParams.set('utm_campaign', utm_campaign);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/validate-affiliate?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      console.log("❌ Affiliate not found:", affiliateCode);
      return false;
    }

    if (response.status === 410) {
      console.log("❌ Affiliate link permanently removed:", affiliateCode);
      return false;
    }

    if (!response.ok) {
      console.error("❌ Error validating affiliate:", response.status);
      return false;
    }

    const data = await response.json();
    if (data.success) {
      console.log("✅ Affiliate validated successfully:", affiliateCode);
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Error validating affiliate:", error);
    return false;
  }
}

export default async function AffiliatePage({ params, searchParams }: AffiliatePageProps) {
  const { affiliateCode } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate affiliate server-side
  const isValidAffiliate = await validateAffiliate(affiliateCode, resolvedSearchParams);

  // If not a valid affiliate, show 404
  if (!isValidAffiliate) {
    notFound();
  }

  // Use the shared homepage component with affiliate code for valid affiliates
  return <SharedHomePage affiliateCode={affiliateCode} />;
}
