const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');

const relative = process.argv[2] === 'local' ? '.' : '../..';

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, relative, 'build'),
    filename: '[name].[hash].js',
    publicPath: '/'
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        include: path.resolve(__dirname, relative, 'src')
      }
    ],
    loaders: [
      {
        test: /\.css$/,
        include: path.resolve(__dirname, relative, 'src'),
        loader: 'style!css!postcss',
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, relative, 'src'),
        loader: 'babel'
      }
    ]
  },
  postcss: function() {
    return [autoprefixer]
  },
  plugins: [
    // TODO: infer from package.json?
    new HtmlWebpackPlugin({ title: 'My React Project'}),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"'}),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ compressor: { warning: false }})
  ]
}
