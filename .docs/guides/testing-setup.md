# Testing Setup Documentation

## Overview

A comprehensive testing framework has been set up for the BrightNest application, including:

- **Jest** for unit and integration tests
- **React Testing Library** for component tests
- **Playwright** for end-to-end (E2E) tests

## Test Structure

### Unit Tests (`__tests__/`)

#### Authentication Tests
- `__tests__/lib/admin-auth-server.test.ts` - Admin authentication utilities
- `__tests__/lib/closer-auth.test.ts` - Closer authentication utilities
- `__tests__/lib/env-validation.test.ts` - Environment variable validation

#### Utility Tests
- `__tests__/lib/rate-limit.test.ts` - Rate limiting functionality
- `__tests__/lib/scoring.test.ts` - Quiz scoring and archetype calculation

#### API Route Tests
- `__tests__/api/admin/auth.test.ts` - Admin authentication endpoint
- `__tests__/api/admin/basic-stats.test.ts` - Admin stats endpoint
- `__tests__/api/quiz/start.test.ts` - Quiz start endpoint
- `__tests__/api/quiz/answer.test.ts` - Quiz answer endpoint
- `__tests__/api/quiz/result.test.ts` - Quiz result endpoint
- `__tests__/api/closer/login.test.ts` - Closer login endpoint
- `__tests__/api/affiliate/login.test.ts` - Affiliate login endpoint

#### Component Tests
- `__tests__/components/SharedHomePage.test.tsx` - Homepage component

### E2E Tests (`e2e/`)

- `e2e/quiz-flow.spec.ts` - Full quiz flow testing
  - Quiz completion flow
  - Affiliate code tracking
  - Loading screens

### Test Utilities (`__tests__/setup/`)

- `__tests__/setup/test-utils.ts` - Shared test utilities and helpers
  - Mock request creation
  - Test data cleanup
  - Database helpers

## Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### All Tests
```bash
# Run both unit and E2E tests
npm run test:all
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Uses Next.js Jest preset
- Node environment for API route tests
- Coverage thresholds: 50% for branches, functions, lines, statements
- Module path mapping: `@/` → root directory

### Jest Setup (`jest.setup.js`)
- Polyfills for Web APIs (Request, Response, fetch)
- Mock Next.js router
- Mock Prisma Client
- Test environment variables

### Playwright Configuration (`playwright.config.ts`)
- Tests run in Chromium, Firefox, and WebKit
- Base URL: `http://localhost:3000`
- Auto-starts dev server before tests

## Test Coverage Goals

- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

## Known Issues

### Polyfill Setup
The test setup requires polyfills for Web APIs (Request, Response, fetch) which can be complex. The current setup uses:
- `undici` for fetch, Request, Response
- `web-streams-polyfill` for ReadableStream, WritableStream, TransformStream
- Node.js `util` for TextEncoder, TextDecoder

Some tests may require additional polyfills or mocking strategies depending on the Node.js version and Jest configuration.

### Database Tests
Tests that interact with the database require:
- A test database connection
- Proper cleanup between tests
- Mock Prisma Client for unit tests

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data after each test
3. **Mocking**: Mock external dependencies (database, APIs, etc.)
4. **Coverage**: Aim for meaningful coverage, not just high numbers
5. **E2E Tests**: Use E2E tests for critical user flows, not for every feature

## Next Steps

1. **Fix Polyfill Issues**: Resolve remaining polyfill setup issues for full test suite execution
2. **Add More Tests**: Expand test coverage for:
   - More API routes
   - More components
   - More utility functions
3. **CI/CD Integration**: Set up automated test runs in CI/CD pipeline
4. **Performance Tests**: Add performance testing for critical endpoints
5. **Visual Regression**: Consider adding visual regression testing for UI components

## Test Files Created

### Configuration Files
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup file
- `jest.polyfills.js` - Web API polyfills
- `playwright.config.ts` - Playwright configuration

### Test Files (15+ test files)
- Authentication tests (3 files)
- Utility tests (2 files)
- API route tests (7 files)
- Component tests (1 file)
- E2E tests (1 file)
- Test utilities (1 file)

## Dependencies Added

### Testing Dependencies
- `jest` - Test framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `jest-environment-jsdom` - DOM environment for Jest
- `@types/jest` - TypeScript types for Jest
- `ts-jest` - TypeScript support for Jest
- `@playwright/test` - E2E testing framework

### Polyfill Dependencies
- `undici` - Fetch API polyfill
- `web-streams-polyfill` - Web Streams API polyfill
- `node-fetch` - Alternative fetch polyfill (backup)

## Notes

- Tests are designed to be run in a CI/CD environment
- Some tests may require environment variables to be set
- Database tests should use a separate test database
- E2E tests require the application to be running (auto-started by Playwright)

