import babel from 'rollup-plugin-babel'
import eslint from 'rollup-plugin-eslint'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const {
  entry,
  format = 'umd',
} = process.env

const dest = format === 'es' ? `${entry}.${format}` : `${entry}`

export default {
  input: `src/${entry}.js`,
  output: {
    file: `dist/${dest}.js`,
    format,
    name: entry,
  },
  sourceMap: false, // removes the sourcemap at the bottom of the file
  treeshake: true,
  plugins: [
    resolve({
      main: true,
      browser: true,
    }),
    commonjs(),
    eslint({
      exclude: [],
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
}
