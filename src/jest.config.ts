import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/**/*test.ts'],
  verbose: true,
  forceExit: true,
};

export default config;
