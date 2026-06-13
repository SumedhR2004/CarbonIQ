import { describe, it, expect } from 'vitest';
import { 
  calculateCategoryScore, 
  calculateTotalScore, 
  generateActionPlan,
  getCategoryBreakdown
} from '../utils/carbonRules';

describe('CarbonIQ Calculations & Rules (8-Category Model)', () => {
  
  describe('calculateCategoryScore', () => {
    it('should calculate transport scores correctly', () => {
      expect(calculateCategoryScore('transport', 'car')).toBe(4600);
      expect(calculateCategoryScore('transport', 'public transport')).toBe(1500);
      expect(calculateCategoryScore('transport', 'bike')).toBe(0);
      expect(calculateCategoryScore('transport', 'walking')).toBe(0);
      // Null returns 0
      expect(calculateCategoryScore('transport', null)).toBe(0);
    });

    it('should apply commute distance modifier to transport', () => {
      // Car + under 5km = 4600 * 0.3 = 1380
      expect(calculateCategoryScore('transport', 'car', { commuteDistance: 'under 5 km' })).toBe(1380);
      // Car + over 30km = 4600 * 1.5 = 6900
      expect(calculateCategoryScore('transport', 'car', { commuteDistance: 'over 30 km' })).toBe(6900);
      // Public + 5-15km = 1500 * 0.7 = 1050
      expect(calculateCategoryScore('transport', 'public', { commuteDistance: '5-15 km' })).toBe(1050);
    });

    it('should calculate diet scores correctly', () => {
      expect(calculateCategoryScore('diet', 'meat daily')).toBe(3300);
      expect(calculateCategoryScore('diet', 'meat sometimes')).toBe(2000);
      expect(calculateCategoryScore('diet', 'vegetarian')).toBe(1500);
      expect(calculateCategoryScore('diet', 'vegan')).toBe(1000);
      expect(calculateCategoryScore('diet', null)).toBe(0);
    });

    it('should calculate food waste scores correctly', () => {
      expect(calculateCategoryScore('foodWaste', 'a lot')).toBe(1100);
      expect(calculateCategoryScore('foodWaste', 'some')).toBe(500);
      expect(calculateCategoryScore('foodWaste', 'very little')).toBe(150);
      expect(calculateCategoryScore('foodWaste', null)).toBe(0);
    });

    it('should calculate electricity scores correctly', () => {
      // 2 hours = 2 * 1.5 * 365 = 1095
      expect(calculateCategoryScore('electricity', 2)).toBe(1095);
      expect(calculateCategoryScore('electricity', 0)).toBe(0);
      expect(calculateCategoryScore('electricity', null)).toBe(0);
    });

    it('should calculate digital footprint scores correctly', () => {
      // 3 hours = 3 * 25 = 75
      expect(calculateCategoryScore('digital', 3)).toBe(75);
      expect(calculateCategoryScore('digital', 0)).toBe(0);
      expect(calculateCategoryScore('digital', null)).toBe(0);
    });

    it('should calculate shopping scores correctly', () => {
      expect(calculateCategoryScore('shopping', 'weekly')).toBe(1200);
      expect(calculateCategoryScore('shopping', 'monthly')).toBe(600);
      expect(calculateCategoryScore('shopping', 'rarely')).toBe(200);
      expect(calculateCategoryScore('shopping', null)).toBe(0);
    });

    it('should calculate flights scores correctly', () => {
      expect(calculateCategoryScore('flights', 3)).toBe(1500);
      expect(calculateCategoryScore('flights', 0)).toBe(0);
      expect(calculateCategoryScore('flights', null)).toBe(0);
    });

    it('should return 0 for commuteDistance (modifier only)', () => {
      expect(calculateCategoryScore('commuteDistance', 'under 5 km')).toBe(0);
    });
  });

  describe('calculateTotalScore', () => {
    it('should compute correct total score for sample input', () => {
      const answers = {
        transport: 'car',
        commuteDistance: '15-30 km', // modifier = 1.0, so car stays 4600
        diet: 'vegetarian',
        foodWaste: 'some',
        electricity: 3,
        digital: 2,
        shopping: 'monthly',
        flights: 2
      };
      
      // Expected:
      // transport: 4600 * 1.0 = 4600
      // diet: 1500
      // foodWaste: 500
      // electricity: 3 * 547.5 = 1642.5
      // digital: 2 * 25 = 50
      // shopping: 600
      // flights: 2 * 500 = 1000
      // Total: 4600 + 1500 + 500 + 1642.5 + 50 + 600 + 1000 = 9892.5
      expect(calculateTotalScore(answers)).toBe(9892.5);
    });

    it('should return 0 for all-null answers', () => {
      const answers = {
        transport: null, commuteDistance: null, diet: null, foodWaste: null,
        electricity: null, digital: null, shopping: null, flights: null
      };
      expect(calculateTotalScore(answers)).toBe(0);
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should return only categories with scores > 0', () => {
      const answers = {
        transport: 'car', commuteDistance: null, diet: 'vegan',
        foodWaste: null, electricity: 0, digital: 0,
        shopping: 'rarely', flights: 0
      };
      const breakdown = getCategoryBreakdown(answers);
      const keys = breakdown.map(c => c.key);
      expect(keys).toContain('transport');
      expect(keys).toContain('diet');
      expect(keys).toContain('shopping');
      expect(keys).not.toContain('electricity');
      expect(keys).not.toContain('flights');
    });
  });

  describe('generateActionPlan', () => {
    it('should generate exactly 3 actions', () => {
      const answers = {
        transport: 'car', commuteDistance: '5-15 km',
        diet: 'vegan', foodWaste: 'very little',
        electricity: 1, digital: 1,
        shopping: 'rarely', flights: 0
      };
      const plan = generateActionPlan(answers);
      expect(plan).toHaveLength(3);
    });

    it('should prioritize the highest scoring categories', () => {
      const answers = {
        transport: 'car',        // 4600 (Highest)
        commuteDistance: null,
        diet: 'meat daily',      // 3300 (Second)
        foodWaste: 'a lot',      // 1100 (Third)
        electricity: 0,
        digital: 0,
        shopping: 'rarely',      // 200
        flights: 0
      };
      const plan = generateActionPlan(answers);
      
      const categoriesInPlan = plan.map(p => p.category);
      expect(categoriesInPlan).toContain('transport');
      expect(categoriesInPlan).toContain('diet');
      expect(categoriesInPlan).toContain('foodWaste');
    });
  });
});
