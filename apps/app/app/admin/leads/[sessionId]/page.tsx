"use client";

import { useParams, useRouter } from "next/navigation";
import LeadDetailView from "@/components/shared/LeadDetailView";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  return (
    <LeadDetailView
      sessionId={sessionId}
      userRole="admin"
      onClose={() => router.back()}
    />
  );
}
