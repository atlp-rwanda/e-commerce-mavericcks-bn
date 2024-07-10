'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/test/**/*.test.ts'],
};
exports.default = config;
