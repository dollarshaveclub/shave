const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const mqpacker = require('css-mqpacker');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');

gulp.task('copy', function() {
  return gulp
    .src('bower_components/shave/dist/shave.js')
    .pipe(gulp.dest(''));
});

gulp.task('styles', function() {
  //const processors = [mqpacker];
  return gulp
    .src('main.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    //.pipe(autoprefixer({browsers: ['last 3 versions']}))
    //.pipe(postcss(processors))
    .pipe(gulp.dest(''));
});

gulp.task('default', ['styles', 'copy']);
