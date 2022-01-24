module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  testRegex: './__tests__/.+\\.(test|spec)\\.ts$',
};
