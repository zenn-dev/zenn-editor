module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['<rootDir>/src/server/__tests__/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.server.json',
    },
  },
  resetMocks: true,
};
