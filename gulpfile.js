const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const mqpacker = require('css-mqpacker');
const autoprefixer = require('gulp-autoprefixer');
const purifycss = require('gulp-purifycss');
const cssnano = require('gulp-cssnano');


gulp.task('copy', function() {
  return gulp
    .src('bower_components/shave/dist/shave.js')
    .pipe(gulp.dest(''));
});

gulp.task('styles', function() {
  const processors = [mqpacker];
  gulp
    .src('main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(autoprefixer({browsers: ['last 3 versions']}))
    .pipe(purifycss([
      'index.html']))
    .pipe(cssnano())
    .pipe(gulp.dest(''));
});

gulp.task('default', ['styles', 'copy']);
