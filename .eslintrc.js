const {init} = require('@ifanrx/eslint-config-standard/init')

module.exports = init({
  root: true,
  extends: ['@ifanrx/standard-react', '@ifanrx/standard'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
  },
})
