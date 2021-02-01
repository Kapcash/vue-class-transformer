const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require("copy-webpack-plugin");

const deps = [
  '@nuxtjs/eslint-config-typescript',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'cli-progress',
  'eslint',
  'mkdirp',
  'vue-template-compiler',
  'yargs',
]

const dependencies = deps.map((dep) => ({ from: `node_modules/${dep}`, to: `node_modules/${dep}` }))

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  target: 'node',
  externals: [nodeExternals()],
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
		// We no not want to minimize our code.
		minimize: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: dependencies
    })
  ],
  module: {
    rules: [
      {
        use: 'ts-loader',
        test: /\.ts?$/,
        exclude: /node_modules/,
      },
    ],
  },
};