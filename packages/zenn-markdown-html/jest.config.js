module.exports = {
  globals: {
    'ts-jest': {
      // avoid "jsx" treated as "preserved"
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: './__tests__/.+\\.(test|spec)\\.ts$',
};
