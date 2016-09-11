const gulp = require('gulp');
const rename = require("gulp-rename");

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');

const yaml = require('gulp-yaml'); 
const mustache = require('gulp-mustache-plus'); 

const webserver = require('gulp-webserver');

// gulp compile json from yml
gulp.task('json', () => {
  gulp.src('page/*.yml')
  .pipe(yaml({ schema: 'DEFAULT_SAFE_SCHEMA'}))
  .pipe(gulp.dest('page/'));
});

// COPY
// copy in foot printless sass mixins
gulp.task('copy', () => {
	gulp
    .src('bower_components/bootstrap-sass/assets/stylesheets/bootstrap/mixins/*.scss')
    .pipe(gulp.dest('mixins/bootstrap/mixins/'));
  gulp
    .src('bower_components/bootstrap-sass/assets/stylesheets/bootstrap/_mixins.scss')
    .pipe(gulp.dest('mixins/bootstrap/'));
  gulp
    .src('bower_components/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss')
    .pipe(gulp.dest('mixins/bootstrap/'));
  gulp
    .src('bower_components/compass-sass-mixins/lib/**/*')
    .pipe(gulp.dest('mixins/compass/'));
  gulp
	.src('bower_components/sassline/assets/sass/sassline-base/_variables.scss')
    .pipe(gulp.dest('mixins/sassline/'));
  gulp
	.src('bower_components/sassline/assets/sass/sassline-base/_mixins.scss')
    .pipe(gulp.dest('mixins/sassline/'));
  gulp
  .src('bower_components/bourbon/assets/stylesheets/**/*')
    .pipe(gulp.dest('mixins/bourbon/'));
  gulp
  .src('bower_components/neat/app/assets/stylesheets/**/*')
    .pipe(gulp.dest('mixins/neat/'));
});

// Styles build styles for the landing page
gulp.task('styles', () => {
  return gulp
  .src('main.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('page/'));
});

gulp.task('view', () => {
  gulp.src('')
    .pipe(webserver({
      open: true,
      fallback: 'index.html'
    }));
});

gulp.task('default', ['json', 'copy', 'styles']);