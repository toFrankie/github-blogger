const {init} = require('@ifanrx/eslint-config-standard-ts/init')

module.exports = init({
  root: true,
  extends: ['@ifanrx/standard-react', '@ifanrx/standard-ts'],
  globals: {
    acquireVsCodeApi: 'readonly',
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
    'consistent-return': 'off',
    'no-param-reassign': 'off',
    '@typescript-eslint/strict-boolean-expressions': ['error', {allowString: true}],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
  },
})
