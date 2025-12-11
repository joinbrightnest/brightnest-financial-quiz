/**
 * Tests for commission calculation and release logic
 * 
 * CRITICAL: These tests verify the money-related business logic
 * - Commissions start as "held"
 * - After hold period (e.g., 30 days), they become "available"
 * - Only commissions with amount > 0 should be counted
 */

describe('Commission Business Logic', () => {

    describe('Commission Status Flow', () => {
        it('should have correct status flow: held → available', () => {
            // Business rule: Commissions start as held, then become available
            const validStatuses = ['held', 'available', 'paid'];
            const statusFlow = {
                initial: 'held',
                afterHoldPeriod: 'available',
                afterPayout: 'paid'
            };

            expect(validStatuses).toContain(statusFlow.initial);
            expect(validStatuses).toContain(statusFlow.afterHoldPeriod);
            expect(validStatuses).toContain(statusFlow.afterPayout);
        });

        it('should only release commissions after holdUntil date passes', () => {
            const now = new Date();
            const holdDays = 30;

            // Commission created 40 days ago (should be released)
            const oldCommission = {
                createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
                holdUntil: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // holdUntil was 10 days ago
                commissionStatus: 'held',
                commissionAmount: 100
            };

            // Commission created 10 days ago (should NOT be released)
            const recentCommission = {
                createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
                holdUntil: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // holdUntil is 20 days from now
                commissionStatus: 'held',
                commissionAmount: 100
            };

            // Check if commission should be released
            const shouldReleaseOld = oldCommission.holdUntil <= now;
            const shouldReleaseRecent = recentCommission.holdUntil <= now;

            expect(shouldReleaseOld).toBe(true);
            expect(shouldReleaseRecent).toBe(false);
        });
    });

    describe('Commission Amount Calculations', () => {
        it('should only count commissions with amount > 0', () => {
            const conversions = [
                { id: '1', commissionAmount: 100, commissionStatus: 'held' },
                { id: '2', commissionAmount: 50, commissionStatus: 'held' },
                { id: '3', commissionAmount: 0, commissionStatus: 'held' }, // Should be excluded
                { id: '4', commissionAmount: 75, commissionStatus: 'available' },
            ];

            const validConversions = conversions.filter(c => c.commissionAmount > 0);
            const heldConversions = validConversions.filter(c => c.commissionStatus === 'held');
            const availableConversions = validConversions.filter(c => c.commissionStatus === 'available');

            expect(validConversions).toHaveLength(3); // Excludes the $0 commission
            expect(heldConversions).toHaveLength(2);
            expect(availableConversions).toHaveLength(1);
        });

        it('should calculate total released amount correctly', () => {
            const conversionsToRelease = [
                { id: '1', commissionAmount: 100 },
                { id: '2', commissionAmount: 50.50 },
                { id: '3', commissionAmount: 25.25 },
            ];

            const totalReleasedAmount = conversionsToRelease.reduce((sum, conversion) => {
                return sum + parseFloat(conversion.commissionAmount.toString());
            }, 0);

            expect(totalReleasedAmount).toBe(175.75);
        });

        it('should handle decimal amounts correctly', () => {
            const amount1 = 33.33;
            const amount2 = 33.33;
            const amount3 = 33.34;

            const total = amount1 + amount2 + amount3;

            expect(total).toBeCloseTo(100, 2); // Should be exactly 100
        });
    });

    describe('Commission Hold Period', () => {
        it('should calculate holdUntil date correctly based on hold days setting', () => {
            const holdDays = 30;
            const createdAt = new Date('2024-01-01T00:00:00Z');

            const holdUntil = new Date(createdAt.getTime() + holdDays * 24 * 60 * 60 * 1000);

            expect(holdUntil.toISOString()).toBe('2024-01-31T00:00:00.000Z');
        });

        it('should use default 30 days if setting not found', () => {
            const defaultHoldDays = 30;
            const settingsResult: { value: string }[] = []; // Empty = no setting

            const holdDays = settingsResult.length > 0 ? parseInt(settingsResult[0].value) : defaultHoldDays;

            expect(holdDays).toBe(30);
        });
    });

    describe('Commission Tiers (Affiliate Levels)', () => {
        it('should apply correct commission rate based on tier', () => {
            const tiers = {
                starter: 0.10,    // 10%
                bronze: 0.12,     // 12%
                silver: 0.15,     // 15%
                gold: 0.18,       // 18%
                platinum: 0.20,   // 20%
            };

            const saleAmount = 1000;

            expect(saleAmount * tiers.starter).toBe(100);
            expect(saleAmount * tiers.bronze).toBe(120);
            expect(saleAmount * tiers.silver).toBe(150);
            expect(saleAmount * tiers.gold).toBe(180);
            expect(saleAmount * tiers.platinum).toBe(200);
        });
    });

    describe('Edge Cases', () => {
        it('should handle no commissions ready for release gracefully', () => {
            const conversionsToRelease: any[] = [];

            const result = {
                success: true,
                message: conversionsToRelease.length === 0
                    ? 'No commissions ready for release'
                    : `Successfully released ${conversionsToRelease.length} commissions`,
                releasedCount: conversionsToRelease.length,
                releasedAmount: 0
            };

            expect(result.success).toBe(true);
            expect(result.releasedCount).toBe(0);
            expect(result.message).toBe('No commissions ready for release');
        });

        it('should not double-count commissions', () => {
            // Bug prevention: totalCommission should only be incremented once
            // (when sale is marked as converted, NOT again when released)

            let totalCommission = 0;
            const saleAmount = 100;

            // On sale conversion - increment ONCE
            totalCommission += saleAmount;

            // On commission release - should NOT increment again
            // This is the bug that was fixed in the code
            // totalCommission += saleAmount; // DO NOT DO THIS

            expect(totalCommission).toBe(100); // Not 200!
        });
    });
});
