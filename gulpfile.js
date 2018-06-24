const gulp = require('gulp')
const qunit = require('node-qunit-phantomjs')

gulp.task('test', () => {
  qunit('tests/index.html', { verbose: true })
})

gulp.task('default', ['test'])
