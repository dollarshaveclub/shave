# rollup-plugin-commonjs changelog

## 4.1.0

* Ignore dead branches ([#93](https://github.com/rollup/rollup-plugin-commonjs/issues/93))

## 4.0.1

* Fix `ignoreGlobal` option ([#86](https://github.com/rollup/rollup-plugin-commonjs/pull/86))

## 4.0.0

* Better interop and smaller output ([#92](https://github.com/rollup/rollup-plugin-commonjs/pull/92))

## 3.3.1

* Deconflict export and local module ([rollup/rollup#554](https://github.com/rollup/rollup/issues/554))

## 3.3.0

* Keep the order of execution for require calls ([#43](https://github.com/rollup/rollup-plugin-commonjs/pull/43))
* Use interopDefault as helper ([#42](https://github.com/rollup/rollup-plugin-commonjs/issues/42))

## 3.2.0

* Use named exports as a function when no default export is defined ([#524](https://github.com/rollup/rollup/issues/524))

## 3.1.0

* Replace `typeof require` with `'function'` ([#38](https://github.com/rollup/rollup-plugin-commonjs/issues/38))
* Don't attempt to resolve entry file relative to importer ([#63](https://github.com/rollup/rollup-plugin-commonjs/issues/63))

## 3.0.2

* Handle multiple references to `global`

## 3.0.1

* Return a `name`

## 3.0.0

* Make `transform` stateless ([#71](https://github.com/rollup/rollup-plugin-commonjs/pull/71))
* Support web worker `global` ([#50](https://github.com/rollup/rollup-plugin-commonjs/issues/50))
* Ignore global with `options.ignoreGlobal` ([#48](https://github.com/rollup/rollup-plugin-commonjs/issues/48))

## 2.2.1

* Prevent false positives with `namedExports` ([#36](https://github.com/rollup/rollup-plugin-commonjs/issues/36))

## 2.2.0

* Rewrite top-level `this` expressions to mean the same as `global`  ([#31](https://github.com/rollup/rollup-plugin-commonjs/issues/31))

## 2.1.0

* Optimised module wrappers ([#20](https://github.com/rollup/rollup-plugin-commonjs/pull/20))
* Allow control over named exports via `options.namedExports` ([#18](https://github.com/rollup/rollup-plugin-commonjs/issues/18))
* Handle bare imports correctly ([#23](https://github.com/rollup/rollup-plugin-commonjs/issues/23))
* Blacklist all reserved words as export names ([#21](https://github.com/rollup/rollup-plugin-commonjs/issues/21))
* Configure allowed file extensions via `options.extensions` ([#27](https://github.com/rollup/rollup-plugin-commonjs/pull/27))

## 2.0.0

* Support for transpiled modules – `exports.default` is used as the default export in place of `module.exports`, if applicable, and `__esModule` is not exported ([#16](https://github.com/rollup/rollup-plugin-commonjs/pull/16))

## 1.4.0

* Generate sourcemaps by default

## 1.3.0

* Handle references to `global` ([#6](https://github.com/rollup/rollup-plugin-commonjs/issues/6))

## 1.2.0

* Generate named exports where possible ([#5](https://github.com/rollup/rollup-plugin-commonjs/issues/5))
* Handle shadowed `require`/`module`/`exports`

## 1.1.0

* Handle dots in filenames ([#3](https://github.com/rollup/rollup-plugin-commonjs/issues/3))
* Wrap modules in IIFE for more readable output

## 1.0.0

* Stable release, now that Rollup supports plugins

## 0.2.1

* Allow mixed CommonJS/ES6 imports/exports
* Use `var` instead of `let`

## 0.2.0

* Sourcemap support
* Support `options.include` and `options.exclude`
* Bail early if module is obviously not a CommonJS module

## 0.1.1

Add dist files to package (whoops!)

## 0.1.0

* First release
