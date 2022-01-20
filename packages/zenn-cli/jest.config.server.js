module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  testMatch: ['<rootDir>/src/server/__tests__/**/*.test.ts'],
  resetMocks: true,
};
