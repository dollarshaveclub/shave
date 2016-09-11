# [gulp][gulp]-cssnano [![Build Status](https://travis-ci.org/ben-eb/gulp-cssnano.svg?branch=master)][ci] [![NPM version](https://badge.fury.io/js/gulp-cssnano.svg)][npm] [![Dependency Status](https://gemnasium.com/ben-eb/gulp-cssnano.svg)][deps]

> Minify CSS with [cssnano](https://github.com/ben-eb/cssnano).

## Install

With [npm](https://npmjs.org/package/gulp-cssnano) do:

```
npm install gulp-cssnano --save-dev
```

## Example

```js
var gulp = require('gulp');
var cssnano = require('gulp-cssnano');

gulp.task('default', function() {
    return gulp.src('./main.css')
        .pipe(cssnano())
        .pipe(gulp.dest('./out'));
});
```

## Source Maps

gulp-cssnano supports [gulp-sourcemaps]:

```js
var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function () {
    return gulp.src('main.css')
        .pipe(sourcemaps.init())
        .pipe(cssnano())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./out'));
});
```

## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests
to cover it.

## License

MIT © [Ben Briggs](http://beneb.info)

[ci]:      https://travis-ci.org/ben-eb/gulp-cssnano
[deps]:    https://gemnasium.com/ben-eb/gulp-cssnano
[gulp]:    https://github.com/gulpjs/gulp
[gulp-sourcemaps]: https://github.com/floridoo/gulp-sourcemaps
[npm]:     http://badge.fury.io/js/gulp-cssnano
