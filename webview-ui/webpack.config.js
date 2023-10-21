const path = require('node:path')

const {HotModuleReplacementPlugin} = require('webpack')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')

// const devServerClientOptions = {
//   hot: true,
//   client: {
//     webSocketURL: {
//       hostname: 'localhost',
//       protocol: 'ws',
//     },
//   },
//   host: 'localhost',
//   port: 8080,
//   allowedHosts: 'all',
// }

const devServerClientOptions = {
  hot: true,
  // !: 指定构造 WebSocket 的协议是 ws
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
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: [...devEntries, path.resolve(__dirname, 'src/index.jsx')],
  output: {
    publicPath: 'http://localhost:8080/',
    path: path.resolve(__dirname, '../dist/webview-ui'),
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
    new HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
    // new HtmlWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
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
