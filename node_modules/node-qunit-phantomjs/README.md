# node-qunit-phantomjs [![Build Status](https://travis-ci.org/jonkemp/node-qunit-phantomjs.svg?branch=master)](https://travis-ci.org/jonkemp/node-qunit-phantomjs)

[![NPM](https://nodei.co/npm/node-qunit-phantomjs.png?downloads=true)](https://nodei.co/npm/node-qunit-phantomjs/)

> Run QUnit unit tests in a headless PhantomJS instance without using Grunt.

Run QUnit unit tests in a PhantomJS-powered headless test runner, providing basic console output for QUnit tests. Uses the [phantomjs](https://github.com/Obvious/phantomjs) node module and the [PhantomJS Runner QUnit Plugin](https://github.com/jonkemp/qunit-phantomjs-runner).

If you're using [gulp](https://github.com/gulpjs/gulp), you should take a look at the [gulp-qunit](https://github.com/jonkemp/gulp-qunit) plugin.


## Install

Install with [npm](https://npmjs.org/package/node-qunit-phantomjs)

globally:
```bash
$ npm install -g node-qunit-phantomjs
```

or locally:
```bash
$ npm install --save-dev node-qunit-phantomjs
```

## Usage

Via command line:
```bash
$ node-qunit-phantomjs ./test/fixture.html
```
With options:
```bash
$ node-qunit-phantomjs ./test/fixture.html --verbose
```
Example setting the viewport size:

```bash
$ node-qunit-phantomjs ./test/fixture.html 5 '{"viewportSize":{"width":1000,"height":1000}}'
```

Or require it as a module:
```js
var qunit = require('node-qunit-phantomjs');

qunit('./test/fixture.html');
```

Verbose option to output list as test cases pass or fail:
```js
var qunit = require('node-qunit-phantomjs');

qunit('./test/fixture.html', { 'verbose': true });
```

Page option example to set the viewport size::
```js
var qunit = require('node-qunit-phantomjs');

qunit('./test/fixture.html', {'page': {
    viewportSize: { width: 1280, height: 800 }
}});
```

Sample [gulp](https://github.com/gulpjs/gulp) task:
```js
var gulp = require('gulp'),
    qunit = require('node-qunit-phantomjs');

gulp.task('qunit', function() {
    qunit('./test/fixture.html');
});
```

## API

### qunit(path-to-test-runner[, options]);

Opens a test runner file in PhantomJS and logs test results to the console.

#### options.verbose

Type: `Boolean`  
Default: `none`  

Add list as test cases pass or fail to output.

#### options.phantomjs-options

Type: `Array`  
Default: `None`

These options are passed on to PhantomJS. See the [PhantomJS documentation](http://phantomjs.org/api/command-line.html) for more information.

#### options.page

Type: `Object`  
Default: `None`

These options are passed on to PhantomJS. See the [PhantomJS documentation](http://phantomjs.org/page-automation.html) for more information.

#### options.timeout

Type: `Number`  
Default: `5`

Pass a number or string value to override the default timeout of 5 seconds.


#### options.customRunner

Type: `String`
Default: `None`

A path to a custom PhantomJS runner script. A custom runner can be used to have more control over PhantomJS (configuration, hooks, etc.). Default runner implementations are provided by the [PhantomJS Runner QUnit Plugin](https://github.com/jonkemp/qunit-phantomjs-runner).

## License

MIT © [Jonathan Kemp](http://jonkemp.com)
