[![Package Quality](http://npm.packagequality.com/badge/gulp-sass-glob.png)](http://packagequality.com/#?package=gulp-sass-glob)

[![Package Quality](http://npm.packagequality.com/shield/gulp-sass-glob.svg)](http://packagequality.com/#?package=gulp-sass-glob)

# gulp-sass-glob

[Gulp](http://gulpjs.com/) plugin for [gulp-sass](https://github.com/dlmanning/gulp-sass) to use glob imports.

# Install

```
npm install gulp-sass-glob --save-dev
```

# Basic Usage

main.scss

```scss
@import "vars/**/*.scss";
@import "mixins/**/*.scss";
@import "generic/**/*.scss";
@import "../components/**/*.scss";
@import "../views/**/*.scss";
```

*NOTE*: Also support using `'` (single quotes) for example: `@import 'vars/**/*.scss';`

gulpfile.js

```javascript
var gulp = require('gulp');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');

gulp.task('styles', function () {
    return gulp
        .src('src/styles/main.scss')
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(gulp.dest('dist/styles'));
});
```

# Thanks and love
- [ViliamKopecky](https://github.com/ViliamKopecky) for fixing base path
- [gulp-sass-glob-import](https://github.com/bleuarg/gulp-sass-glob-import) for inspiration for unit tests etc.
- [Parhumm](https://github.com/parhumm) for fixing windows bug in import files
- [Mjezzi](https://github.com/mjezzi) for fixing single quotes bug
- [Daviestar](https://github.com/daviestar) for fixing re-including main file bug, recursion bug, sass-not-scss bug
