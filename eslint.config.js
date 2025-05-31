const eslint = require('@tomjs/eslint')

module.exports = [
  ...eslint.configs.react,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/prop-types': 'off',
    },
  },
]
