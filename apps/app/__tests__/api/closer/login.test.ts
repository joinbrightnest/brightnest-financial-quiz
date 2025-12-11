/**
 * Tests for closer login API route
 */

import { POST } from '@/app/api/closer/login/route';
import { createMockRequest } from '../../setup/testUtils';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

describe('POST /api/closer/login', () => {
  let testCloser: any;

  beforeEach(async () => {
    // Create a test closer
    const passwordHash = await bcrypt.hash('test-password', 12);
    testCloser = await prisma.closer.create({
      data: {
        email: 'test@closer.com',
        name: 'Test Closer',
        passwordHash,
        isActive: true,
        isApproved: true,
      },
    });
  });

  afterEach(async () => {
    // Clean up test closer
    await prisma.closer.deleteMany({
      where: { email: 'test@closer.com' },
    });
    await prisma.closerAuditLog.deleteMany({
      where: { closerId: testCloser?.id },
    });
  });

  it('should authenticate with correct credentials', async () => {
    const request = createMockRequest('POST', {
      email: 'test@closer.com',
      password: 'test-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.token).toBeDefined();
    expect(data.closer).toBeDefined();
    expect(data.closer.email).toBe('test@closer.com');
    expect(data.closer.name).toBe('Test Closer');
  });

  it('should reject incorrect password', async () => {
    const request = createMockRequest('POST', {
      email: 'test@closer.com',
      password: 'wrong-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid email or password');
    expect(data.token).toBeUndefined();
  });

  it('should reject non-existent email', async () => {
    const request = createMockRequest('POST', {
      email: 'nonexistent@closer.com',
      password: 'test-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid email or password');
  });

  it('should reject inactive closer', async () => {
    await prisma.closer.update({
      where: { id: testCloser.id },
      data: { isActive: false },
    });

    const request = createMockRequest('POST', {
      email: 'test@closer.com',
      password: 'test-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Account is deactivated. Please contact support.');
  });

  it('should reject unapproved closer', async () => {
    await prisma.closer.update({
      where: { id: testCloser.id },
      data: { isApproved: false },
    });

    const request = createMockRequest('POST', {
      email: 'test@closer.com',
      password: 'test-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Account pending approval. Please wait for admin approval.');
  });

  it('should require email and password', async () => {
    const request1 = createMockRequest('POST', {
      email: 'test@closer.com',
    });
    
    const response1 = await POST(request1);
    expect(response1.status).toBe(400);

    const request2 = createMockRequest('POST', {
      password: 'test-password',
    });
    
    const response2 = await POST(request2);
    expect(response2.status).toBe(400);
  });

  it('should create audit log on successful login', async () => {
    const request = createMockRequest('POST', {
      email: 'test@closer.com',
      password: 'test-password',
    });
    
    await POST(request);
    
    const auditLog = await prisma.closerAuditLog.findFirst({
      where: {
        closerId: testCloser.id,
        action: 'login',
      },
    });
    
    expect(auditLog).toBeDefined();
    expect(auditLog?.ipAddress).toBeDefined();
    expect(auditLog?.userAgent).toBeDefined();
  });

  it('should return closer stats in response', async () => {
    await prisma.closer.update({
      where: { id: testCloser.id },
      data: {
        totalCalls: 10,
        totalConversions: 5,
        totalRevenue: 1000,
        conversionRate: 50,
      },
    });

    const request = createMockRequest('POST', {
      email: 'test@closer.com',
      password: 'test-password',
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.closer.totalCalls).toBe(10);
    expect(data.closer.totalConversions).toBe(5);
    expect(data.closer.totalRevenue).toBe(1000);
    expect(data.closer.conversionRate).toBe(50);
  });
});

