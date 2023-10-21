module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: {version: '3.33', proposals: true},
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
}
