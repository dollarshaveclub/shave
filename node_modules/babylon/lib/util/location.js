"use strict";

exports.__esModule = true;
exports.SourceLocation = exports.Position = undefined;
exports.getLineInfo = getLineInfo;

var _whitespace = require("./whitespace");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = exports.Position = function Position(line, col) {
  _classCallCheck(this, Position);

  this.line = line;
  this.column = col;
};

var SourceLocation = exports.SourceLocation = function SourceLocation(start, end) {
  _classCallCheck(this, SourceLocation);

  this.start = start;
  this.end = end;
};

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    _whitespace.lineBreakG.lastIndex = cur;
    var match = _whitespace.lineBreakG.exec(input);
    if (match && match.index < offset) {
      ++line;
      cur = match.index + match[0].length;
    } else {
      return new Position(line, offset - cur);
    }
  }
}