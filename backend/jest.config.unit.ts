import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['\\.integration\\.test\\.ts$', '/node_modules/'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  collectCoverageFrom: ['src/modules/**/*.service.ts'],
  coverageThreshold: { global: { lines: 80 } },
};

export default config;
