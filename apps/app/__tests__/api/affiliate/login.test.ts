/**
 * Tests for affiliate login API route
 */

import { POST } from '@/app/api/affiliate/login/route';
import { createMockRequest } from '../../setup/testUtils';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

describe('POST /api/affiliate/login', () => {
  let testAffiliate: any;

  beforeEach(async () => {
    // Create a test affiliate
    const passwordHash = await bcrypt.hash('test-password', 12);
    testAffiliate = await prisma.affiliate.create({
      data: {
        email: 'test@affiliate.com',
        name: 'Test Affiliate',
        passwordHash,
        referralCode: 'TEST123',
        isApproved: true,
        tier: 'bronze',
        commissionRate: 0.1,
      },
    });
  });

  afterEach(async () => {
    // Clean up test affiliate
    await prisma.affiliate.deleteMany({
      where: { email: 'test@affiliate.com' },
    });
  });

  it('should authenticate with correct credentials', async () => {
    const request = createMockRequest('POST', {
      email: 'test@affiliate.com',
      password: 'test-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.affiliate).toBeDefined();
    expect(data.affiliate.email).toBe('test@affiliate.com');
    expect(data.affiliate.name).toBe('Test Affiliate');
  });

  it('should reject incorrect password', async () => {
    const request = createMockRequest('POST', {
      email: 'test@affiliate.com',
      password: 'wrong-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid email or password');
  });

  it('should reject non-existent email', async () => {
    const request = createMockRequest('POST', {
      email: 'nonexistent@affiliate.com',
      password: 'test-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid email or password');
  });

  it('should reject unapproved affiliate', async () => {
    await prisma.affiliate.update({
      where: { id: testAffiliate.id },
      data: { isApproved: false },
    });

    const request = createMockRequest('POST', {
      email: 'test@affiliate.com',
      password: 'test-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Account pending approval. Please wait for admin approval.');
  });

  it('should require email and password', async () => {
    const request1 = createMockRequest('POST', {
      email: 'test@affiliate.com',
    });
    
    const response1 = await POST(request1);
    expect(response1.status).toBe(400);

    const request2 = createMockRequest('POST', {
      password: 'test-password',
    });
    
    const response2 = await POST(request2);
    expect(response2.status).toBe(400);
  });

  it('should return affiliate stats in response', async () => {
    await prisma.affiliate.update({
      where: { id: testAffiliate.id },
      data: {
        totalClicks: 100,
        totalLeads: 50,
        totalBookings: 10,
        totalSales: 5000,
        totalCommission: 500,
      },
    });

    const request = createMockRequest('POST', {
      email: 'test@affiliate.com',
      password: 'test-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.affiliate.totalClicks).toBe(100);
    expect(data.affiliate.totalLeads).toBe(50);
    expect(data.affiliate.totalBookings).toBe(10);
    expect(data.affiliate.totalSales).toBe(5000);
    expect(data.affiliate.totalCommission).toBe(500);
  });
});

