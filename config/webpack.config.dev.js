const path = require('path');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isInNodeModules = 'node_modules' ===
  path.basename(path.resolve(path.join(__dirname, '..', '..')));
let relativePath = isInNodeModules ? '../../..' : '..';
const isInDebugMode = process.argv.some(arg =>
  arg.indexOf('--debug-template') > -1
);
if(isInDebugMode) {
  relativePath = '../template';
}

const srcPath = path.resolve(__dirname, relativePath, 'src');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const indexHtmlPath = path.resolve(__dirname, relativePath, 'index.html');
const faviconPath = path.resolve(__dirname, relativePath, 'favicon.ico');
const buildPath = path.join(__dirname, isInNodeModules ? '../../..' : '..', 'build');


module.exports = {
  devtool: 'eval',
  entry: [
    require.resolve('webpack-dev-server/client') + '?http://localhost:3000',
    require.resolve('webpack/hot/dev-server'),
    path.join(srcPath, 'index')
  ],
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: buildPath,
    pathinfo: true,
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['', '.js'],
  },
  resolveLoader: {
    root: nodeModulesPath,
    moduleTemplates: ['*-loader']
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        include: srcPath,
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        include: srcPath,
        loader: 'babel',
        query: require('./babel.dev')
      },
      {
        test: /\.css$/,
        include: srcPath,
        loader: 'style!css!postcss'
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
        loader: 'file',
      },
      {
        test: /\.(mp4|webm)$/,
        loader: 'url?limit=10000'
      }
    ]
  },
  eslint: {
    configFile: path.join(__dirname, 'eslint.js'),
    useEslintrc: false
  },
  postcss: function() {
    return [autoprefixer];
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: indexHtmlPath,
      favicon: faviconPath,
    }),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
    // Note: only CSS is currently hot reloaded
    new webpack.HotModuleReplacementPlugin()
  ]
};
