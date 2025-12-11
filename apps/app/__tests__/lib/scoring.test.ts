/**
 * Tests for scoring utilities
 */

import { calculateArchetype, getArchetypeInsights, ScoreCategory } from '@/lib/scoring';

describe('Scoring Utilities', () => {
  describe('calculateArchetype', () => {
    it('should return Debt Crusher for high debt score', () => {
      const scores: ScoreCategory = {
        debt: 10,
        savings: 2,
        spending: 2,
        investing: 2,
      };
      
      const archetype = calculateArchetype(scores);
      
      expect(archetype).toBe('Debt Crusher');
    });

    it('should return Savings Builder for high savings score', () => {
      const scores: ScoreCategory = {
        debt: 2,
        savings: 10,
        spending: 2,
        investing: 2,
      };
      
      const archetype = calculateArchetype(scores);
      
      expect(archetype).toBe('Savings Builder');
    });

    it('should return Stability Seeker for high spending score', () => {
      const scores: ScoreCategory = {
        debt: 2,
        savings: 2,
        spending: 10,
        investing: 2,
      };
      
      const archetype = calculateArchetype(scores);
      
      expect(archetype).toBe('Stability Seeker');
    });

    it('should return Optimizer for high investing score', () => {
      const scores: ScoreCategory = {
        debt: 2,
        savings: 2,
        spending: 2,
        investing: 10,
      };
      
      const archetype = calculateArchetype(scores);
      
      expect(archetype).toBe('Optimizer');
    });

    it('should return Stability Seeker for balanced scores (default)', () => {
      const scores: ScoreCategory = {
        debt: 5,
        savings: 5,
        spending: 5,
        investing: 5,
      };
      
      const archetype = calculateArchetype(scores);
      
      expect(archetype).toBe('Stability Seeker');
    });

    it('should handle zero scores', () => {
      const scores: ScoreCategory = {
        debt: 0,
        savings: 0,
        spending: 0,
        investing: 0,
      };
      
      const archetype = calculateArchetype(scores);
      
      expect(archetype).toBeDefined();
    });

    it('should handle negative scores', () => {
      const scores: ScoreCategory = {
        debt: -5,
        savings: 5,
        spending: 5,
        investing: 5,
      };
      
      const archetype = calculateArchetype(scores);
      
      expect(archetype).toBeDefined();
    });
  });

  describe('getArchetypeInsights', () => {
    it('should return insights for Debt Crusher', () => {
      const insights = getArchetypeInsights('Debt Crusher');
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should return insights for Savings Builder', () => {
      const insights = getArchetypeInsights('Savings Builder');
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should return insights for Stability Seeker', () => {
      const insights = getArchetypeInsights('Stability Seeker');
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should return insights for Optimizer', () => {
      const insights = getArchetypeInsights('Optimizer');
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should return default insights for unknown archetype', () => {
      const insights = getArchetypeInsights('Unknown Archetype');
      
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      // Should return Stability Seeker insights as default
      expect(insights[0]).toContain('predictable');
    });
  });
});

