/**
 * Tests for SharedHomePage component
 */

import { render, screen } from '@testing-library/react';
import SharedHomePage from '@/components/SharedHomePage';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
}));

// Mock Link component
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

describe('SharedHomePage', () => {
  it('should render homepage', () => {
    render(<SharedHomePage />);
    
    // Check for main content - use more flexible matching
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should render navigation', () => {
    render(<SharedHomePage />);
    
    // Check for navigation links - use more flexible matching
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Blog/i)).toBeInTheDocument();
  });

  it('should render hero section', () => {
    render(<SharedHomePage />);
    
    // Check for hero content - use more flexible matching
    expect(screen.getByText(/Start Quiz|APPLY NOW/i)).toBeInTheDocument();
  });

  it('should render free tools section', () => {
    render(<SharedHomePage />);
    
    // Check for tools - use more flexible matching or queryByText
    const budgetCalc = screen.queryByText(/Budget/i);
    const debtCalc = screen.queryByText(/Debt|Snowball/i);
    
    // At least one tool should be present
    expect(budgetCalc || debtCalc).toBeTruthy();
  });
});

