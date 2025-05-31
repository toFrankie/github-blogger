/**
 * @type {import("prettier").Config}
 */
module.exports = {
  ...require('@tomjs/prettier'),
  semi: false,
  bracketSpacing: false,
  trailingComma: 'es5',
}
