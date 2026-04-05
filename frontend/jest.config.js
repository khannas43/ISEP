/** @type {import('jest').Config} */
const nextJest = require('next/jest');
const path = require('path');

const createJestConfig = nextJest({ dir: './' });

// All test results go under repo Testing/ folder (see Testing/RUN-TESTING.md)
const repoRoot = path.resolve(__dirname, '..');
const testingDir = process.env.TEST_RESULTS_BASE || path.join(repoRoot, 'Testing');
const coverageDir = path.join(testingDir, 'coverage', 'frontend');

const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/tests/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: coverageDir,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(config);
