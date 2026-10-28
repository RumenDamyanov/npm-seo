module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/integrations/frameworks.test.ts', // Temporarily disabled due to Jest worker issues with framework mocking
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
    '^.+\\.js$': [
      'ts-jest',
      {
        tsconfig: {
          allowJs: true,
          esModuleInterop: true,
          module: 'commonjs',
          isolatedModules: true,
        },
      },
    ],
  },
  transformIgnorePatterns: ['^(?!.*node_modules/sanitize-html/).*node_modules.*'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!tests/**/*'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 90,
      lines: 85,
      statements: 85,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  verbose: true,
};
