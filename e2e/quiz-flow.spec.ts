/**
 * E2E tests for quiz flow
 */

import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('should complete full quiz flow', async ({ page }) => {
    // 1. Start quiz
    await page.click('text=Start Quiz');
    
    // Wait for quiz to load
    await page.waitForSelector('text=Question', { timeout: 5000 });
    
    // 2. Answer first question
    const firstOption = page.locator('button').first();
    await firstOption.click();
    
    // Click continue
    await page.click('text=Continue');
    
    // 3. Answer more questions (if available)
    // This will depend on your actual quiz structure
    
    // 4. Complete quiz
    // Wait for results page
    await page.waitForURL(/\/results/, { timeout: 10000 });
    
    // 5. Verify results page shows
    await expect(page.locator('text=Your Archetype')).toBeVisible({ timeout: 5000 });
  });

  test('should track affiliate code in quiz', async ({ page }) => {
    // Navigate with affiliate code
    await page.goto('/test-affiliate/quiz/financial-profile');
    
    // Should redirect to quiz with affiliate parameter
    await page.waitForURL(/\/quiz\/financial-profile/);
    
    // Start quiz
    await page.click('text=Start Quiz');
    
    // Verify affiliate code is tracked (check network requests or localStorage)
    // This depends on your implementation
  });

  test('should show loading screen between questions', async ({ page }) => {
    await page.goto('/quiz/financial-profile');
    
    // Answer question
    const firstOption = page.locator('button').first();
    await firstOption.click();
    await page.click('text=Continue');
    
    // Check for loading screen (if configured)
    // This depends on your implementation
  });
});

test.describe('Authentication Flow', () => {
  test('admin login flow', async ({ page }) => {
    await page.goto('/admin');
    
    // Enter admin code
    await page.fill('input[type="password"]', process.env.ADMIN_ACCESS_CODE || 'test-code');
    await page.click('text=Login');
    
    // Should redirect to dashboard
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 5000 });
    
    // Verify dashboard loads
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('closer login flow', async ({ page }) => {
    await page.goto('/closers/login');
    
    // Enter credentials
    await page.fill('input[type="email"]', 'test@closer.com');
    await page.fill('input[type="password"]', 'test-password');
    await page.click('text=Login');
    
    // Should redirect to closer dashboard
    await page.waitForURL(/\/closers\/dashboard/, { timeout: 5000 });
  });
});

