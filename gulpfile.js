const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');

gulp.task('test', function() {
  qunit('tests/index.html');
});

gulp.task('default', ['test']);
