const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const node_modules = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  entry: {
    ['index']: './src/index.ts',
    ['thread.worker']: './src/thread.worker.ts'
  },
  target: 'node',
  externals: [node_modules()],
  plugins: [new CleanWebpackPlugin()],
  node: {
    global: false,
    __filename: false,
    __dirname: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  }
};
