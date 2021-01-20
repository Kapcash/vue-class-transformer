import uglify from 'rollup-plugin-uglify';
import commonjs from '@rollup/plugin-commonjs'
import typescriptPlugin from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve'
import ts from 'typescript'
import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: {
    file: pkg.main,
    format: 'cjs',
    sourcemap: true,
  },
  external: [
    ...Object.keys(pkg.dependencies || {})
  ],
  plugins: [
    resolve(),
    typescriptPlugin({
      typescript: ts,
    }),
    commonjs(),
    process.env.NODE_ENV === 'production' && uglify()
  ],
};