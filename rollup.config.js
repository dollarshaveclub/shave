import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'src/shave.js',
  dest: 'dist/shave.js',
  format: 'umd',
  moduleName: 'shave',
  sourceMap: false, // removes the souremap at the bottom of the file
  treeshake: false,
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    eslint({
      exclude: []
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
