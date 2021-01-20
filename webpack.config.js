const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'out.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  target: "node",
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
		// We no not want to minimize our code.
		minimize: true
	},
  module: {
    rules: [
      {
        use: 'ts-loader',
        test: /\.ts?$/,
        exclude: /node_modules/,
      }
    ]
  },
};