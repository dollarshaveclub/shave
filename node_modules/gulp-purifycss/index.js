var through = require('through2');
var glob = require('glob');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var purify = require('purify-css');

const PLUGIN_NAME = 'gulp-purifycss';

module.exports = function(source, options) {
  var sourceFiles = [];
  source.forEach(function(pathPattern) {
    var files = glob.sync(pathPattern);
    sourceFiles = sourceFiles.concat(files);
  });
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
    }
    if (file.isBuffer()) {
      try {
        purify(sourceFiles, file.contents.toString(), options, function(output){
          file.contents = new Buffer(output);
          cb(null, file);
        });
      } catch(error) {
        this.emit('error', new PluginError(PLUGIN_NAME, error));
        return cb(error);
      }
    }
    if (file.isStream()) {
      var css = '';
      file.on('readable',function(buffer){
        var part = buffer.read().toString();
        css += part;
      });
      file.on('end',function(){
        try {
          purify(sourceFiles, css, options, function(output){
            file.contents = new Buffer(output);
            cb(null, file);
          });
        } catch(error) {
          this.emit('error', new PluginError(PLUGIN_NAME, error));
          return cb(error);
        }
      });
    }
  });
};
