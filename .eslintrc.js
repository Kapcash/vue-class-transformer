module.exports = {
  'ignorePatterns': [ '*.js', '*.vue' ],
  'parser': '@typescript-eslint/parser',
  'plugins': [
    '@typescript-eslint',
  ],
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    quotes: ['error', 'single'],
    semi: 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-namespace': 'off',
  },
};