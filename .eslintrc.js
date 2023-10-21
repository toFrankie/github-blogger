const {init} = require('@ifanrx/eslint-config-standard-ts/init')

module.exports = init({
  root: true,
  extends: ['@ifanrx/standard-react', '@ifanrx/standard-ts'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
  },
})
