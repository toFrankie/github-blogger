const path = require('node:path')

const {DefinePlugin, HotModuleReplacementPlugin} = require('webpack')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')

const isDevMode = process.env.NODE_ENV === 'development'

const devServerClientOptions = {
  hot: true,
  protocol: 'ws',
  hostname: 'localhost',
  port: 8080,
}

const devServerClientQuery = Object.entries(devServerClientOptions)
  .map(([k, v]) => `${k}=${v}`)
  .join('&')

const webpackHotDevServer = path.resolve(__dirname, './webpack-hot-dev-server.js')
const devEntries = [
  webpackHotDevServer,
  `webpack-dev-server/client/index.js?${devServerClientQuery}`,
]

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: isDevMode ? 'development' : 'production',

  devtool: isDevMode ? 'eval-cheap-module-source-map' : false,

  entry: isDevMode
    ? [...devEntries, path.resolve(__dirname, 'src/index.jsx')]
    : [path.resolve(__dirname, 'src/index.jsx')],

  output: {
    clean: true,
    publicPath: isDevMode ? 'http://localhost:8080/' : '/',
    path: path.resolve(__dirname, '../dist/webview-ui'),
    chunkFilename: isDevMode ? '[id].js' : '[name].[contenthash:5].js',
    filename: 'index.js',
  },

  devServer: {
    hot: false,
    client: false,
    liveReload: false,
    host: 'localhost',
    port: 8080,
    open: false,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  plugins: [
    isDevMode && new HotModuleReplacementPlugin(),
    isDevMode && new ReactRefreshWebpackPlugin(),
    new DefinePlugin({'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)}),
    // new HtmlWebpackPlugin(),
  ].filter(Boolean),

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },

  optimization: {
    chunkIds: 'named',
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: {cacheDirectory: true},
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {importLoaders: 1},
          },
        ],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
        generator: {
          filename: 'images/[hash]-[name][ext][query]',
        },
      },
    ],
  },
}
