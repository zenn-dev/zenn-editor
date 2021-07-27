module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:react/recommended', // ESLint couldn't find the plugin "eslint-plugin-react".
    // 'plugin:jsx-a11y/recommended', // ESLint couldn't find the plugin "eslint-plugin-jsx-a11y".
    // Prettier plugin and recommended rules
    // 'prettier/@typescript-eslint', // "prettier/@typescript-eslint" has been merged into "prettier" in eslint-config-prettier 8.0.0.
    // 'plugin:prettier/recommended', // ESLint couldn't find the plugin "eslint-plugin-prettier".
  ],
  rules: {
    // Include .prettierrc.js rules
    'no-empty': 'off',
    // 'prettier/prettier': ['error', {}, {usePrettierrc: true}], // Definition for rule 'prettier/prettier' was not found
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // 'jsx-a11y/alt-text': 'off', // Definition for rule 'jsx-a11y/label-has-associated-control' was not found
    // 'jsx-a11y/accessible-emoji': 'off',
    // 'jsx-a11y/anchor-is-valid': 'off',
    // 'jsx-a11y/label-has-associated-control': [
    //   'error',
    //   {
    //     labelComponents: [],
    //     labelAttributes: [],
    //     controlComponents: [],
    //     assert: 'either',
    //     depth: 25,
    //   },
    // ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
