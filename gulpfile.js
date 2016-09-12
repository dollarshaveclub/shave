const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const rename = require('gulp-rename');
const purifyCss = require('gulp-purifycss');
const cssNano = require('gulp-cssnano');
const qunit = require('node-qunit-phantomjs');
const babel = require('gulp-babel');

gulp.task('scripts', () => {
  return gulp
    .src('src/jquery.truncated.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(gulp.dest('dist/'));
});

gulp.task('styles', () => {
  gulp
    .src('src/styles/_truncated_mixin.scss')
    .pipe(gulp.dest('dist/'));
  gulp
    .src('src/styles/truncated.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({basename: '_truncated', extname: '.scss'}))
    .pipe(gulp.dest('dist/'));
  gulp
    .src('src/styles/truncated.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(cssNano())
    .pipe(gulp.dest('dist/'));
  return gulp
    .src('src/styles/package-only/main.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(purifyCss(['index.html']))
    .pipe(cssNano())
    .pipe(gulp.dest(''));

});

// gulp.task('test', function() {
//   qunit('src/tests/plain/index.html');
//   qunit('src/tests/jquery/index.html');
// });

gulp.task('default', ['scripts', 'styles']);
