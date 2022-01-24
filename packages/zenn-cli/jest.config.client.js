module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  testMatch: [
    '<rootDir>/src/client/__tests__/**/*.test.ts',
    '<rootDir>/src/common/__tests__/**/*.test.ts',
  ],
  resetMocks: true,
};
