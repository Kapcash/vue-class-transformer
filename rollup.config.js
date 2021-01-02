import uglify from 'rollup-plugin-uglify';
import typescriptPlugin from 'rollup-plugin-typescript2';
import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: {
    file: pkg.main,
    format: 'es',
  },
  external: [
    ...Object.keys(pkg.dependencies || {})
  ],
  plugins: [
    typescriptPlugin({
      typescript: require('typescript'),
    }),
    process.env.NODE_ENV === 'production' && uglify()
  ],
};