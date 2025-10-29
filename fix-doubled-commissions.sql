-- =====================================================
-- FIX DOUBLED COMMISSION BUG
-- =====================================================
-- Problem: Affiliate.totalCommission was incremented TWICE:
--   1. When sale was marked "converted" 
--   2. When commission was released from hold
-- 
-- This script recalculates totalCommission correctly
-- from actual sales data.
-- =====================================================

-- First, let's see the current state (for verification)
SELECT 
    a.name,
    a."referralCode",
    a."commissionRate",
    a."totalCommission" as current_total_commission,
    COUNT(DISTINCT apt.id) FILTER (WHERE apt.outcome = 'converted' AND apt."saleValue" IS NOT NULL) as converted_appointments,
    SUM(CASE WHEN apt.outcome = 'converted' THEN apt."saleValue" ELSE 0 END) as total_revenue,
    SUM(CASE WHEN apt.outcome = 'converted' THEN apt."commissionAmount" ELSE 0 END) as commission_from_appointments,
    -- Calculate what totalCommission SHOULD be (revenue * commission rate)
    (SUM(CASE WHEN apt.outcome = 'converted' THEN apt."saleValue" ELSE 0 END) * a."commissionRate") as correct_total_commission
FROM "Affiliate" a
LEFT JOIN "Appointment" apt ON apt."affiliateCode" = a."referralCode"
WHERE a."isApproved" = true
GROUP BY a.id, a.name, a."referralCode", a."commissionRate", a."totalCommission"
ORDER BY a.name;

-- =====================================================
-- BACKUP CURRENT VALUES (SAFETY FIRST!)
-- =====================================================
-- Create a backup table if it doesn't exist
CREATE TABLE IF NOT EXISTS "AffiliateCommissionBackup" (
    id TEXT PRIMARY KEY,
    "affiliateId" TEXT NOT NULL,
    "affiliateName" TEXT NOT NULL,
    "oldTotalCommission" DECIMAL(10, 2) NOT NULL,
    "newTotalCommission" DECIMAL(10, 2) NOT NULL,
    "backedUpAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert current values as backup
INSERT INTO "AffiliateCommissionBackup" (id, "affiliateId", "affiliateName", "oldTotalCommission", "newTotalCommission")
SELECT 
    gen_random_uuid()::text,
    a.id,
    a.name,
    a."totalCommission" as "oldTotalCommission",
    COALESCE(
        SUM(CASE WHEN apt.outcome = 'converted' AND apt."saleValue" IS NOT NULL 
            THEN apt."saleValue" * a."commissionRate" 
            ELSE 0 
        END),
        0
    ) as "newTotalCommission"
FROM "Affiliate" a
LEFT JOIN "Appointment" apt ON apt."affiliateCode" = a."referralCode"
WHERE a."isApproved" = true
GROUP BY a.id, a.name, a."totalCommission", a."commissionRate"
ON CONFLICT DO NOTHING;

-- =====================================================
-- UPDATE AFFILIATE TOTAL COMMISSIONS
-- =====================================================
-- Recalculate totalCommission from actual converted appointments
UPDATE "Affiliate" a
SET "totalCommission" = COALESCE(
    (
        SELECT SUM(apt."saleValue" * a."commissionRate")
        FROM "Appointment" apt
        WHERE apt."affiliateCode" = a."referralCode"
          AND apt.outcome = 'converted'
          AND apt."saleValue" IS NOT NULL
          AND apt."saleValue" > 0
    ),
    0
)
WHERE a."isApproved" = true;

-- =====================================================
-- VERIFICATION: Show before/after comparison
-- =====================================================
SELECT 
    b."affiliateName",
    b."oldTotalCommission",
    b."newTotalCommission",
    (b."oldTotalCommission" - b."newTotalCommission") as difference,
    CASE 
        WHEN b."oldTotalCommission" > 0 THEN 
            ROUND(((b."oldTotalCommission" - b."newTotalCommission") / b."oldTotalCommission") * 100, 2)
        ELSE 0
    END as "difference_percentage"
FROM "AffiliateCommissionBackup" b
ORDER BY b."affiliateName";

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================
-- For Manuel: Should go from ~$70-80 down to $40
-- For others: Should be divided by approximately 2 if they were doubled
--
-- If numbers look wrong, you can rollback using:
-- UPDATE "Affiliate" a
-- SET "totalCommission" = b."oldTotalCommission"
-- FROM "AffiliateCommissionBackup" b
-- WHERE a.id = b."affiliateId";
-- =====================================================

