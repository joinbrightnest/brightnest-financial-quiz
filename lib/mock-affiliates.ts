// Mock affiliate data storage (in production, this would be in a database)
export const mockAffiliates: any[] = [];

export function addMockAffiliate(affiliate: any) {
  mockAffiliates.push(affiliate);
}

export function findMockAffiliate(email: string) {
  return mockAffiliates.find(aff => aff.email === email);
}

export function findMockAffiliateById(id: string) {
  return mockAffiliates.find(aff => aff.id === id);
}
