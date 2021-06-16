module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/src/client/__tests__/**/*.test.ts',
    '<rootDir>/src/common/__tests__/**/*.test.ts',
  ],
  resetMocks: true,
};
