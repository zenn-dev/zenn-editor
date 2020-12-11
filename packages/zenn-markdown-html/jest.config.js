module.exports = {
  globals: {
    'ts-jest': {
      // avoid "jsx" treated as "preserved"
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts'],
};
