'use strict';

exports.__esModule = true;

var _jsBase = require('js-base64');

var _sourceMap = require('source-map');

var _sourceMap2 = _interopRequireDefault(_sourceMap);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapGenerator = function () {
    function MapGenerator(stringify, root, opts) {
        _classCallCheck(this, MapGenerator);

        this.stringify = stringify;
        this.mapOpts = opts.map || {};
        this.root = root;
        this.opts = opts;
    }

    MapGenerator.prototype.isMap = function isMap() {
        if (typeof this.opts.map !== 'undefined') {
            return !!this.opts.map;
        } else {
            return this.previous().length > 0;
        }
    };

    MapGenerator.prototype.previous = function previous() {
        var _this = this;

        if (!this.previousMaps) {
            this.previousMaps = [];
            this.root.walk(function (node) {
                if (node.source && node.source.input.map) {
                    var map = node.source.input.map;
                    if (_this.previousMaps.indexOf(map) === -1) {
                        _this.previousMaps.push(map);
                    }
                }
            });
        }

        return this.previousMaps;
    };

    MapGenerator.prototype.isInline = function isInline() {
        if (typeof this.mapOpts.inline !== 'undefined') {
            return this.mapOpts.inline;
        }

        var annotation = this.mapOpts.annotation;
        if (typeof annotation !== 'undefined' && annotation !== true) {
            return false;
        }

        if (this.previous().length) {
            return this.previous().some(function (i) {
                return i.inline;
            });
        } else {
            return true;
        }
    };

    MapGenerator.prototype.isSourcesContent = function isSourcesContent() {
        if (typeof this.mapOpts.sourcesContent !== 'undefined') {
            return this.mapOpts.sourcesContent;
        }
        if (this.previous().length) {
            return this.previous().some(function (i) {
                return i.withContent();
            });
        } else {
            return true;
        }
    };

    MapGenerator.prototype.clearAnnotation = function clearAnnotation() {
        if (this.mapOpts.annotation === false) return;

        var node = void 0;
        for (var i = this.root.nodes.length - 1; i >= 0; i--) {
            node = this.root.nodes[i];
            if (node.type !== 'comment') continue;
            if (node.text.indexOf('# sourceMappingURL=') === 0) {
                this.root.removeChild(i);
            }
        }
    };

    MapGenerator.prototype.setSourcesContent = function setSourcesContent() {
        var _this2 = this;

        var already = {};
        this.root.walk(function (node) {
            if (node.source) {
                var from = node.source.input.from;
                if (from && !already[from]) {
                    already[from] = true;
                    var relative = _this2.relative(from);
                    _this2.map.setSourceContent(relative, node.source.input.css);
                }
            }
        });
    };

    MapGenerator.prototype.applyPrevMaps = function applyPrevMaps() {
        for (var _iterator = this.previous(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var prev = _ref;

            var from = this.relative(prev.file);
            var root = prev.root || _path2.default.dirname(prev.file);
            var map = void 0;

            if (this.mapOpts.sourcesContent === false) {
                map = new _sourceMap2.default.SourceMapConsumer(prev.text);
                if (map.sourcesContent) {
                    map.sourcesContent = map.sourcesContent.map(function () {
                        return null;
                    });
                }
            } else {
                map = prev.consumer();
            }

            this.map.applySourceMap(map, from, this.relative(root));
        }
    };

    MapGenerator.prototype.isAnnotation = function isAnnotation() {
        if (this.isInline()) {
            return true;
        } else if (typeof this.mapOpts.annotation !== 'undefined') {
            return this.mapOpts.annotation;
        } else if (this.previous().length) {
            return this.previous().some(function (i) {
                return i.annotation;
            });
        } else {
            return true;
        }
    };

    MapGenerator.prototype.addAnnotation = function addAnnotation() {
        var content = void 0;

        if (this.isInline()) {
            content = 'data:application/json;base64,' + _jsBase.Base64.encode(this.map.toString());
        } else if (typeof this.mapOpts.annotation === 'string') {
            content = this.mapOpts.annotation;
        } else {
            content = this.outputFile() + '.map';
        }

        var eol = '\n';
        if (this.css.indexOf('\r\n') !== -1) eol = '\r\n';

        this.css += eol + '/*# sourceMappingURL=' + content + ' */';
    };

    MapGenerator.prototype.outputFile = function outputFile() {
        if (this.opts.to) {
            return this.relative(this.opts.to);
        } else if (this.opts.from) {
            return this.relative(this.opts.from);
        } else {
            return 'to.css';
        }
    };

    MapGenerator.prototype.generateMap = function generateMap() {
        this.generateString();
        if (this.isSourcesContent()) this.setSourcesContent();
        if (this.previous().length > 0) this.applyPrevMaps();
        if (this.isAnnotation()) this.addAnnotation();

        if (this.isInline()) {
            return [this.css];
        } else {
            return [this.css, this.map];
        }
    };

    MapGenerator.prototype.relative = function relative(file) {
        if (/^\w+:\/\//.test(file)) return file;

        var from = this.opts.to ? _path2.default.dirname(this.opts.to) : '.';

        if (typeof this.mapOpts.annotation === 'string') {
            from = _path2.default.dirname(_path2.default.resolve(from, this.mapOpts.annotation));
        }

        file = _path2.default.relative(from, file);
        if (_path2.default.sep === '\\') {
            return file.replace(/\\/g, '/');
        } else {
            return file;
        }
    };

    MapGenerator.prototype.sourcePath = function sourcePath(node) {
        if (this.mapOpts.from) {
            return this.mapOpts.from;
        } else {
            return this.relative(node.source.input.from);
        }
    };

    MapGenerator.prototype.generateString = function generateString() {
        var _this3 = this;

        this.css = '';
        this.map = new _sourceMap2.default.SourceMapGenerator({ file: this.outputFile() });

        var line = 1;
        var column = 1;

        var lines = void 0,
            last = void 0;
        this.stringify(this.root, function (str, node, type) {
            _this3.css += str;

            if (node && type !== 'end') {
                if (node.source && node.source.start) {
                    _this3.map.addMapping({
                        source: _this3.sourcePath(node),
                        generated: { line: line, column: column - 1 },
                        original: {
                            line: node.source.start.line,
                            column: node.source.start.column - 1
                        }
                    });
                } else {
                    _this3.map.addMapping({
                        source: '<no source>',
                        original: { line: 1, column: 0 },
                        generated: { line: line, column: column - 1 }
                    });
                }
            }

            lines = str.match(/\n/g);
            if (lines) {
                line += lines.length;
                last = str.lastIndexOf('\n');
                column = str.length - last;
            } else {
                column += str.length;
            }

            if (node && type !== 'start') {
                if (node.source && node.source.end) {
                    _this3.map.addMapping({
                        source: _this3.sourcePath(node),
                        generated: { line: line, column: column - 1 },
                        original: {
                            line: node.source.end.line,
                            column: node.source.end.column
                        }
                    });
                } else {
                    _this3.map.addMapping({
                        source: '<no source>',
                        original: { line: 1, column: 0 },
                        generated: { line: line, column: column - 1 }
                    });
                }
            }
        });
    };

    MapGenerator.prototype.generate = function generate() {
        this.clearAnnotation();

        if (this.isMap()) {
            return this.generateMap();
        } else {
            var result = '';
            this.stringify(this.root, function (i) {
                result += i;
            });
            return [result];
        }
    };

    return MapGenerator;
}();

exports.default = MapGenerator;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hcC1nZW5lcmF0b3IuZXM2Il0sIm5hbWVzIjpbIk1hcEdlbmVyYXRvciIsInN0cmluZ2lmeSIsInJvb3QiLCJvcHRzIiwibWFwT3B0cyIsIm1hcCIsImlzTWFwIiwicHJldmlvdXMiLCJsZW5ndGgiLCJwcmV2aW91c01hcHMiLCJ3YWxrIiwibm9kZSIsInNvdXJjZSIsImlucHV0IiwiaW5kZXhPZiIsInB1c2giLCJpc0lubGluZSIsImlubGluZSIsImFubm90YXRpb24iLCJzb21lIiwiaSIsImlzU291cmNlc0NvbnRlbnQiLCJzb3VyY2VzQ29udGVudCIsIndpdGhDb250ZW50IiwiY2xlYXJBbm5vdGF0aW9uIiwibm9kZXMiLCJ0eXBlIiwidGV4dCIsInJlbW92ZUNoaWxkIiwic2V0U291cmNlc0NvbnRlbnQiLCJhbHJlYWR5IiwiZnJvbSIsInJlbGF0aXZlIiwic2V0U291cmNlQ29udGVudCIsImNzcyIsImFwcGx5UHJldk1hcHMiLCJwcmV2IiwiZmlsZSIsImRpcm5hbWUiLCJTb3VyY2VNYXBDb25zdW1lciIsImNvbnN1bWVyIiwiYXBwbHlTb3VyY2VNYXAiLCJpc0Fubm90YXRpb24iLCJhZGRBbm5vdGF0aW9uIiwiY29udGVudCIsImVuY29kZSIsInRvU3RyaW5nIiwib3V0cHV0RmlsZSIsImVvbCIsInRvIiwiZ2VuZXJhdGVNYXAiLCJnZW5lcmF0ZVN0cmluZyIsInRlc3QiLCJyZXNvbHZlIiwic2VwIiwicmVwbGFjZSIsInNvdXJjZVBhdGgiLCJTb3VyY2VNYXBHZW5lcmF0b3IiLCJsaW5lIiwiY29sdW1uIiwibGluZXMiLCJsYXN0Iiwic3RyIiwic3RhcnQiLCJhZGRNYXBwaW5nIiwiZ2VuZXJhdGVkIiwib3JpZ2luYWwiLCJtYXRjaCIsImxhc3RJbmRleE9mIiwiZW5kIiwiZ2VuZXJhdGUiLCJyZXN1bHQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7Ozs7OztJQUVxQkEsWTtBQUVqQiwwQkFBWUMsU0FBWixFQUF1QkMsSUFBdkIsRUFBNkJDLElBQTdCLEVBQW1DO0FBQUE7O0FBQy9CLGFBQUtGLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsYUFBS0csT0FBTCxHQUFpQkQsS0FBS0UsR0FBTCxJQUFZLEVBQTdCO0FBQ0EsYUFBS0gsSUFBTCxHQUFpQkEsSUFBakI7QUFDQSxhQUFLQyxJQUFMLEdBQWlCQSxJQUFqQjtBQUNIOzsyQkFFREcsSyxvQkFBUTtBQUNKLFlBQUssT0FBTyxLQUFLSCxJQUFMLENBQVVFLEdBQWpCLEtBQXlCLFdBQTlCLEVBQTRDO0FBQ3hDLG1CQUFPLENBQUMsQ0FBQyxLQUFLRixJQUFMLENBQVVFLEdBQW5CO0FBQ0gsU0FGRCxNQUVPO0FBQ0gsbUJBQU8sS0FBS0UsUUFBTCxHQUFnQkMsTUFBaEIsR0FBeUIsQ0FBaEM7QUFDSDtBQUNKLEs7OzJCQUVERCxRLHVCQUFXO0FBQUE7O0FBQ1AsWUFBSyxDQUFDLEtBQUtFLFlBQVgsRUFBMEI7QUFDdEIsaUJBQUtBLFlBQUwsR0FBb0IsRUFBcEI7QUFDQSxpQkFBS1AsSUFBTCxDQUFVUSxJQUFWLENBQWdCLGdCQUFRO0FBQ3BCLG9CQUFLQyxLQUFLQyxNQUFMLElBQWVELEtBQUtDLE1BQUwsQ0FBWUMsS0FBWixDQUFrQlIsR0FBdEMsRUFBNEM7QUFDeEMsd0JBQUlBLE1BQU1NLEtBQUtDLE1BQUwsQ0FBWUMsS0FBWixDQUFrQlIsR0FBNUI7QUFDQSx3QkFBSyxNQUFLSSxZQUFMLENBQWtCSyxPQUFsQixDQUEwQlQsR0FBMUIsTUFBbUMsQ0FBQyxDQUF6QyxFQUE2QztBQUN6Qyw4QkFBS0ksWUFBTCxDQUFrQk0sSUFBbEIsQ0FBdUJWLEdBQXZCO0FBQ0g7QUFDSjtBQUNKLGFBUEQ7QUFRSDs7QUFFRCxlQUFPLEtBQUtJLFlBQVo7QUFDSCxLOzsyQkFFRE8sUSx1QkFBVztBQUNQLFlBQUssT0FBTyxLQUFLWixPQUFMLENBQWFhLE1BQXBCLEtBQStCLFdBQXBDLEVBQWtEO0FBQzlDLG1CQUFPLEtBQUtiLE9BQUwsQ0FBYWEsTUFBcEI7QUFDSDs7QUFFRCxZQUFJQyxhQUFhLEtBQUtkLE9BQUwsQ0FBYWMsVUFBOUI7QUFDQSxZQUFLLE9BQU9BLFVBQVAsS0FBc0IsV0FBdEIsSUFBcUNBLGVBQWUsSUFBekQsRUFBZ0U7QUFDNUQsbUJBQU8sS0FBUDtBQUNIOztBQUVELFlBQUssS0FBS1gsUUFBTCxHQUFnQkMsTUFBckIsRUFBOEI7QUFDMUIsbUJBQU8sS0FBS0QsUUFBTCxHQUFnQlksSUFBaEIsQ0FBc0I7QUFBQSx1QkFBS0MsRUFBRUgsTUFBUDtBQUFBLGFBQXRCLENBQVA7QUFDSCxTQUZELE1BRU87QUFDSCxtQkFBTyxJQUFQO0FBQ0g7QUFDSixLOzsyQkFFREksZ0IsK0JBQW1CO0FBQ2YsWUFBSyxPQUFPLEtBQUtqQixPQUFMLENBQWFrQixjQUFwQixLQUF1QyxXQUE1QyxFQUEwRDtBQUN0RCxtQkFBTyxLQUFLbEIsT0FBTCxDQUFha0IsY0FBcEI7QUFDSDtBQUNELFlBQUssS0FBS2YsUUFBTCxHQUFnQkMsTUFBckIsRUFBOEI7QUFDMUIsbUJBQU8sS0FBS0QsUUFBTCxHQUFnQlksSUFBaEIsQ0FBc0I7QUFBQSx1QkFBS0MsRUFBRUcsV0FBRixFQUFMO0FBQUEsYUFBdEIsQ0FBUDtBQUNILFNBRkQsTUFFTztBQUNILG1CQUFPLElBQVA7QUFDSDtBQUNKLEs7OzJCQUVEQyxlLDhCQUFrQjtBQUNkLFlBQUssS0FBS3BCLE9BQUwsQ0FBYWMsVUFBYixLQUE0QixLQUFqQyxFQUF5Qzs7QUFFekMsWUFBSVAsYUFBSjtBQUNBLGFBQU0sSUFBSVMsSUFBSSxLQUFLbEIsSUFBTCxDQUFVdUIsS0FBVixDQUFnQmpCLE1BQWhCLEdBQXlCLENBQXZDLEVBQTBDWSxLQUFLLENBQS9DLEVBQWtEQSxHQUFsRCxFQUF3RDtBQUNwRFQsbUJBQU8sS0FBS1QsSUFBTCxDQUFVdUIsS0FBVixDQUFnQkwsQ0FBaEIsQ0FBUDtBQUNBLGdCQUFLVCxLQUFLZSxJQUFMLEtBQWMsU0FBbkIsRUFBK0I7QUFDL0IsZ0JBQUtmLEtBQUtnQixJQUFMLENBQVViLE9BQVYsQ0FBa0IscUJBQWxCLE1BQTZDLENBQWxELEVBQXNEO0FBQ2xELHFCQUFLWixJQUFMLENBQVUwQixXQUFWLENBQXNCUixDQUF0QjtBQUNIO0FBQ0o7QUFDSixLOzsyQkFFRFMsaUIsZ0NBQW9CO0FBQUE7O0FBQ2hCLFlBQUlDLFVBQVUsRUFBZDtBQUNBLGFBQUs1QixJQUFMLENBQVVRLElBQVYsQ0FBZ0IsZ0JBQVE7QUFDcEIsZ0JBQUtDLEtBQUtDLE1BQVYsRUFBbUI7QUFDZixvQkFBSW1CLE9BQU9wQixLQUFLQyxNQUFMLENBQVlDLEtBQVosQ0FBa0JrQixJQUE3QjtBQUNBLG9CQUFLQSxRQUFRLENBQUNELFFBQVFDLElBQVIsQ0FBZCxFQUE4QjtBQUMxQkQsNEJBQVFDLElBQVIsSUFBZ0IsSUFBaEI7QUFDQSx3QkFBSUMsV0FBVyxPQUFLQSxRQUFMLENBQWNELElBQWQsQ0FBZjtBQUNBLDJCQUFLMUIsR0FBTCxDQUFTNEIsZ0JBQVQsQ0FBMEJELFFBQTFCLEVBQW9DckIsS0FBS0MsTUFBTCxDQUFZQyxLQUFaLENBQWtCcUIsR0FBdEQ7QUFDSDtBQUNKO0FBQ0osU0FURDtBQVVILEs7OzJCQUVEQyxhLDRCQUFnQjtBQUNaLDZCQUFrQixLQUFLNUIsUUFBTCxFQUFsQixrSEFBb0M7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBLGdCQUExQjZCLElBQTBCOztBQUNoQyxnQkFBSUwsT0FBTyxLQUFLQyxRQUFMLENBQWNJLEtBQUtDLElBQW5CLENBQVg7QUFDQSxnQkFBSW5DLE9BQU9rQyxLQUFLbEMsSUFBTCxJQUFhLGVBQUtvQyxPQUFMLENBQWFGLEtBQUtDLElBQWxCLENBQXhCO0FBQ0EsZ0JBQUloQyxZQUFKOztBQUVBLGdCQUFLLEtBQUtELE9BQUwsQ0FBYWtCLGNBQWIsS0FBZ0MsS0FBckMsRUFBNkM7QUFDekNqQixzQkFBTSxJQUFJLG9CQUFRa0MsaUJBQVosQ0FBOEJILEtBQUtULElBQW5DLENBQU47QUFDQSxvQkFBS3RCLElBQUlpQixjQUFULEVBQTBCO0FBQ3RCakIsd0JBQUlpQixjQUFKLEdBQXFCakIsSUFBSWlCLGNBQUosQ0FBbUJqQixHQUFuQixDQUF3QjtBQUFBLCtCQUFNLElBQU47QUFBQSxxQkFBeEIsQ0FBckI7QUFDSDtBQUNKLGFBTEQsTUFLTztBQUNIQSxzQkFBTStCLEtBQUtJLFFBQUwsRUFBTjtBQUNIOztBQUVELGlCQUFLbkMsR0FBTCxDQUFTb0MsY0FBVCxDQUF3QnBDLEdBQXhCLEVBQTZCMEIsSUFBN0IsRUFBbUMsS0FBS0MsUUFBTCxDQUFjOUIsSUFBZCxDQUFuQztBQUNIO0FBQ0osSzs7MkJBRUR3QyxZLDJCQUFlO0FBQ1gsWUFBSyxLQUFLMUIsUUFBTCxFQUFMLEVBQXVCO0FBQ25CLG1CQUFPLElBQVA7QUFDSCxTQUZELE1BRU8sSUFBSyxPQUFPLEtBQUtaLE9BQUwsQ0FBYWMsVUFBcEIsS0FBbUMsV0FBeEMsRUFBc0Q7QUFDekQsbUJBQU8sS0FBS2QsT0FBTCxDQUFhYyxVQUFwQjtBQUNILFNBRk0sTUFFQSxJQUFLLEtBQUtYLFFBQUwsR0FBZ0JDLE1BQXJCLEVBQThCO0FBQ2pDLG1CQUFPLEtBQUtELFFBQUwsR0FBZ0JZLElBQWhCLENBQXNCO0FBQUEsdUJBQUtDLEVBQUVGLFVBQVA7QUFBQSxhQUF0QixDQUFQO0FBQ0gsU0FGTSxNQUVBO0FBQ0gsbUJBQU8sSUFBUDtBQUNIO0FBQ0osSzs7MkJBRUR5QixhLDRCQUFnQjtBQUNaLFlBQUlDLGdCQUFKOztBQUVBLFlBQUssS0FBSzVCLFFBQUwsRUFBTCxFQUF1QjtBQUNuQjRCLHNCQUFVLGtDQUNDLGVBQU9DLE1BQVAsQ0FBZSxLQUFLeEMsR0FBTCxDQUFTeUMsUUFBVCxFQUFmLENBRFg7QUFHSCxTQUpELE1BSU8sSUFBSyxPQUFPLEtBQUsxQyxPQUFMLENBQWFjLFVBQXBCLEtBQW1DLFFBQXhDLEVBQW1EO0FBQ3REMEIsc0JBQVUsS0FBS3hDLE9BQUwsQ0FBYWMsVUFBdkI7QUFFSCxTQUhNLE1BR0E7QUFDSDBCLHNCQUFVLEtBQUtHLFVBQUwsS0FBb0IsTUFBOUI7QUFDSDs7QUFFRCxZQUFJQyxNQUFRLElBQVo7QUFDQSxZQUFLLEtBQUtkLEdBQUwsQ0FBU3BCLE9BQVQsQ0FBaUIsTUFBakIsTUFBNkIsQ0FBQyxDQUFuQyxFQUF1Q2tDLE1BQU0sTUFBTjs7QUFFdkMsYUFBS2QsR0FBTCxJQUFZYyxNQUFNLHVCQUFOLEdBQWdDSixPQUFoQyxHQUEwQyxLQUF0RDtBQUNILEs7OzJCQUVERyxVLHlCQUFhO0FBQ1QsWUFBSyxLQUFLNUMsSUFBTCxDQUFVOEMsRUFBZixFQUFvQjtBQUNoQixtQkFBTyxLQUFLakIsUUFBTCxDQUFjLEtBQUs3QixJQUFMLENBQVU4QyxFQUF4QixDQUFQO0FBQ0gsU0FGRCxNQUVPLElBQUssS0FBSzlDLElBQUwsQ0FBVTRCLElBQWYsRUFBc0I7QUFDekIsbUJBQU8sS0FBS0MsUUFBTCxDQUFjLEtBQUs3QixJQUFMLENBQVU0QixJQUF4QixDQUFQO0FBQ0gsU0FGTSxNQUVBO0FBQ0gsbUJBQU8sUUFBUDtBQUNIO0FBQ0osSzs7MkJBRURtQixXLDBCQUFjO0FBQ1YsYUFBS0MsY0FBTDtBQUNBLFlBQUssS0FBSzlCLGdCQUFMLEVBQUwsRUFBa0MsS0FBS1EsaUJBQUw7QUFDbEMsWUFBSyxLQUFLdEIsUUFBTCxHQUFnQkMsTUFBaEIsR0FBeUIsQ0FBOUIsRUFBa0MsS0FBSzJCLGFBQUw7QUFDbEMsWUFBSyxLQUFLTyxZQUFMLEVBQUwsRUFBa0MsS0FBS0MsYUFBTDs7QUFFbEMsWUFBSyxLQUFLM0IsUUFBTCxFQUFMLEVBQXVCO0FBQ25CLG1CQUFPLENBQUMsS0FBS2tCLEdBQU4sQ0FBUDtBQUNILFNBRkQsTUFFTztBQUNILG1CQUFPLENBQUMsS0FBS0EsR0FBTixFQUFXLEtBQUs3QixHQUFoQixDQUFQO0FBQ0g7QUFDSixLOzsyQkFFRDJCLFEscUJBQVNLLEksRUFBTTtBQUNYLFlBQUssWUFBWWUsSUFBWixDQUFpQmYsSUFBakIsQ0FBTCxFQUE4QixPQUFPQSxJQUFQOztBQUU5QixZQUFJTixPQUFPLEtBQUs1QixJQUFMLENBQVU4QyxFQUFWLEdBQWUsZUFBS1gsT0FBTCxDQUFhLEtBQUtuQyxJQUFMLENBQVU4QyxFQUF2QixDQUFmLEdBQTRDLEdBQXZEOztBQUVBLFlBQUssT0FBTyxLQUFLN0MsT0FBTCxDQUFhYyxVQUFwQixLQUFtQyxRQUF4QyxFQUFtRDtBQUMvQ2EsbUJBQU8sZUFBS08sT0FBTCxDQUFjLGVBQUtlLE9BQUwsQ0FBYXRCLElBQWIsRUFBbUIsS0FBSzNCLE9BQUwsQ0FBYWMsVUFBaEMsQ0FBZCxDQUFQO0FBQ0g7O0FBRURtQixlQUFPLGVBQUtMLFFBQUwsQ0FBY0QsSUFBZCxFQUFvQk0sSUFBcEIsQ0FBUDtBQUNBLFlBQUssZUFBS2lCLEdBQUwsS0FBYSxJQUFsQixFQUF5QjtBQUNyQixtQkFBT2pCLEtBQUtrQixPQUFMLENBQWEsS0FBYixFQUFvQixHQUFwQixDQUFQO0FBQ0gsU0FGRCxNQUVPO0FBQ0gsbUJBQU9sQixJQUFQO0FBQ0g7QUFDSixLOzsyQkFFRG1CLFUsdUJBQVc3QyxJLEVBQU07QUFDYixZQUFLLEtBQUtQLE9BQUwsQ0FBYTJCLElBQWxCLEVBQXlCO0FBQ3JCLG1CQUFPLEtBQUszQixPQUFMLENBQWEyQixJQUFwQjtBQUNILFNBRkQsTUFFTztBQUNILG1CQUFPLEtBQUtDLFFBQUwsQ0FBY3JCLEtBQUtDLE1BQUwsQ0FBWUMsS0FBWixDQUFrQmtCLElBQWhDLENBQVA7QUFDSDtBQUNKLEs7OzJCQUVEb0IsYyw2QkFBaUI7QUFBQTs7QUFDYixhQUFLakIsR0FBTCxHQUFXLEVBQVg7QUFDQSxhQUFLN0IsR0FBTCxHQUFXLElBQUksb0JBQVFvRCxrQkFBWixDQUErQixFQUFFcEIsTUFBTSxLQUFLVSxVQUFMLEVBQVIsRUFBL0IsQ0FBWDs7QUFFQSxZQUFJVyxPQUFTLENBQWI7QUFDQSxZQUFJQyxTQUFTLENBQWI7O0FBRUEsWUFBSUMsY0FBSjtBQUFBLFlBQVdDLGFBQVg7QUFDQSxhQUFLNUQsU0FBTCxDQUFlLEtBQUtDLElBQXBCLEVBQTBCLFVBQUM0RCxHQUFELEVBQU1uRCxJQUFOLEVBQVllLElBQVosRUFBcUI7QUFDM0MsbUJBQUtRLEdBQUwsSUFBWTRCLEdBQVo7O0FBRUEsZ0JBQUtuRCxRQUFRZSxTQUFTLEtBQXRCLEVBQThCO0FBQzFCLG9CQUFLZixLQUFLQyxNQUFMLElBQWVELEtBQUtDLE1BQUwsQ0FBWW1ELEtBQWhDLEVBQXdDO0FBQ3BDLDJCQUFLMUQsR0FBTCxDQUFTMkQsVUFBVCxDQUFvQjtBQUNoQnBELGdDQUFXLE9BQUs0QyxVQUFMLENBQWdCN0MsSUFBaEIsQ0FESztBQUVoQnNELG1DQUFXLEVBQUVQLFVBQUYsRUFBUUMsUUFBUUEsU0FBUyxDQUF6QixFQUZLO0FBR2hCTyxrQ0FBVztBQUNQUixrQ0FBUS9DLEtBQUtDLE1BQUwsQ0FBWW1ELEtBQVosQ0FBa0JMLElBRG5CO0FBRVBDLG9DQUFRaEQsS0FBS0MsTUFBTCxDQUFZbUQsS0FBWixDQUFrQkosTUFBbEIsR0FBMkI7QUFGNUI7QUFISyxxQkFBcEI7QUFRSCxpQkFURCxNQVNPO0FBQ0gsMkJBQUt0RCxHQUFMLENBQVMyRCxVQUFULENBQW9CO0FBQ2hCcEQsZ0NBQVcsYUFESztBQUVoQnNELGtDQUFXLEVBQUVSLE1BQU0sQ0FBUixFQUFXQyxRQUFRLENBQW5CLEVBRks7QUFHaEJNLG1DQUFXLEVBQUVQLFVBQUYsRUFBUUMsUUFBUUEsU0FBUyxDQUF6QjtBQUhLLHFCQUFwQjtBQUtIO0FBQ0o7O0FBRURDLG9CQUFRRSxJQUFJSyxLQUFKLENBQVUsS0FBVixDQUFSO0FBQ0EsZ0JBQUtQLEtBQUwsRUFBYTtBQUNURix3QkFBU0UsTUFBTXBELE1BQWY7QUFDQXFELHVCQUFTQyxJQUFJTSxXQUFKLENBQWdCLElBQWhCLENBQVQ7QUFDQVQseUJBQVNHLElBQUl0RCxNQUFKLEdBQWFxRCxJQUF0QjtBQUNILGFBSkQsTUFJTztBQUNIRiwwQkFBVUcsSUFBSXRELE1BQWQ7QUFDSDs7QUFFRCxnQkFBS0csUUFBUWUsU0FBUyxPQUF0QixFQUFnQztBQUM1QixvQkFBS2YsS0FBS0MsTUFBTCxJQUFlRCxLQUFLQyxNQUFMLENBQVl5RCxHQUFoQyxFQUFzQztBQUNsQywyQkFBS2hFLEdBQUwsQ0FBUzJELFVBQVQsQ0FBb0I7QUFDaEJwRCxnQ0FBVyxPQUFLNEMsVUFBTCxDQUFnQjdDLElBQWhCLENBREs7QUFFaEJzRCxtQ0FBVyxFQUFFUCxVQUFGLEVBQVFDLFFBQVFBLFNBQVMsQ0FBekIsRUFGSztBQUdoQk8sa0NBQVc7QUFDUFIsa0NBQVEvQyxLQUFLQyxNQUFMLENBQVl5RCxHQUFaLENBQWdCWCxJQURqQjtBQUVQQyxvQ0FBUWhELEtBQUtDLE1BQUwsQ0FBWXlELEdBQVosQ0FBZ0JWO0FBRmpCO0FBSEsscUJBQXBCO0FBUUgsaUJBVEQsTUFTTztBQUNILDJCQUFLdEQsR0FBTCxDQUFTMkQsVUFBVCxDQUFvQjtBQUNoQnBELGdDQUFXLGFBREs7QUFFaEJzRCxrQ0FBVyxFQUFFUixNQUFNLENBQVIsRUFBV0MsUUFBUSxDQUFuQixFQUZLO0FBR2hCTSxtQ0FBVyxFQUFFUCxVQUFGLEVBQVFDLFFBQVFBLFNBQVMsQ0FBekI7QUFISyxxQkFBcEI7QUFLSDtBQUNKO0FBQ0osU0FqREQ7QUFrREgsSzs7MkJBRURXLFEsdUJBQVc7QUFDUCxhQUFLOUMsZUFBTDs7QUFFQSxZQUFLLEtBQUtsQixLQUFMLEVBQUwsRUFBb0I7QUFDaEIsbUJBQU8sS0FBSzRDLFdBQUwsRUFBUDtBQUNILFNBRkQsTUFFTztBQUNILGdCQUFJcUIsU0FBUyxFQUFiO0FBQ0EsaUJBQUt0RSxTQUFMLENBQWUsS0FBS0MsSUFBcEIsRUFBMEIsYUFBSztBQUMzQnFFLDBCQUFVbkQsQ0FBVjtBQUNILGFBRkQ7QUFHQSxtQkFBTyxDQUFDbUQsTUFBRCxDQUFQO0FBQ0g7QUFDSixLOzs7OztrQkFuUWdCdkUsWSIsImZpbGUiOiJtYXAtZ2VuZXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZTY0IH0gZnJvbSAnanMtYmFzZTY0JztcbmltcG9ydCAgIG1vemlsbGEgIGZyb20gJ3NvdXJjZS1tYXAnO1xuaW1wb3J0ICAgcGF0aCAgICAgZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcEdlbmVyYXRvciB7XG5cbiAgICBjb25zdHJ1Y3RvcihzdHJpbmdpZnksIHJvb3QsIG9wdHMpIHtcbiAgICAgICAgdGhpcy5zdHJpbmdpZnkgPSBzdHJpbmdpZnk7XG4gICAgICAgIHRoaXMubWFwT3B0cyAgID0gb3B0cy5tYXAgfHwgeyB9O1xuICAgICAgICB0aGlzLnJvb3QgICAgICA9IHJvb3Q7XG4gICAgICAgIHRoaXMub3B0cyAgICAgID0gb3B0cztcbiAgICB9XG5cbiAgICBpc01hcCgpIHtcbiAgICAgICAgaWYgKCB0eXBlb2YgdGhpcy5vcHRzLm1hcCAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICByZXR1cm4gISF0aGlzLm9wdHMubWFwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJldmlvdXMoKS5sZW5ndGggPiAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJldmlvdXMoKSB7XG4gICAgICAgIGlmICggIXRoaXMucHJldmlvdXNNYXBzICkge1xuICAgICAgICAgICAgdGhpcy5wcmV2aW91c01hcHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMucm9vdC53YWxrKCBub2RlID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIG5vZGUuc291cmNlICYmIG5vZGUuc291cmNlLmlucHV0Lm1hcCApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hcCA9IG5vZGUuc291cmNlLmlucHV0Lm1hcDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLnByZXZpb3VzTWFwcy5pbmRleE9mKG1hcCkgPT09IC0xICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c01hcHMucHVzaChtYXApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wcmV2aW91c01hcHM7XG4gICAgfVxuXG4gICAgaXNJbmxpbmUoKSB7XG4gICAgICAgIGlmICggdHlwZW9mIHRoaXMubWFwT3B0cy5pbmxpbmUgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwT3B0cy5pbmxpbmU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYW5ub3RhdGlvbiA9IHRoaXMubWFwT3B0cy5hbm5vdGF0aW9uO1xuICAgICAgICBpZiAoIHR5cGVvZiBhbm5vdGF0aW9uICE9PSAndW5kZWZpbmVkJyAmJiBhbm5vdGF0aW9uICE9PSB0cnVlICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB0aGlzLnByZXZpb3VzKCkubGVuZ3RoICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJldmlvdXMoKS5zb21lKCBpID0+IGkuaW5saW5lICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlzU291cmNlc0NvbnRlbnQoKSB7XG4gICAgICAgIGlmICggdHlwZW9mIHRoaXMubWFwT3B0cy5zb3VyY2VzQ29udGVudCAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tYXBPcHRzLnNvdXJjZXNDb250ZW50O1xuICAgICAgICB9XG4gICAgICAgIGlmICggdGhpcy5wcmV2aW91cygpLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByZXZpb3VzKCkuc29tZSggaSA9PiBpLndpdGhDb250ZW50KCkgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xlYXJBbm5vdGF0aW9uKCkge1xuICAgICAgICBpZiAoIHRoaXMubWFwT3B0cy5hbm5vdGF0aW9uID09PSBmYWxzZSApIHJldHVybjtcblxuICAgICAgICBsZXQgbm9kZTtcbiAgICAgICAgZm9yICggbGV0IGkgPSB0aGlzLnJvb3Qubm9kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5yb290Lm5vZGVzW2ldO1xuICAgICAgICAgICAgaWYgKCBub2RlLnR5cGUgIT09ICdjb21tZW50JyApIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCBub2RlLnRleHQuaW5kZXhPZignIyBzb3VyY2VNYXBwaW5nVVJMPScpID09PSAwICkge1xuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5yZW1vdmVDaGlsZChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFNvdXJjZXNDb250ZW50KCkge1xuICAgICAgICBsZXQgYWxyZWFkeSA9IHsgfTtcbiAgICAgICAgdGhpcy5yb290LndhbGsoIG5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKCBub2RlLnNvdXJjZSApIHtcbiAgICAgICAgICAgICAgICBsZXQgZnJvbSA9IG5vZGUuc291cmNlLmlucHV0LmZyb207XG4gICAgICAgICAgICAgICAgaWYgKCBmcm9tICYmICFhbHJlYWR5W2Zyb21dICkge1xuICAgICAgICAgICAgICAgICAgICBhbHJlYWR5W2Zyb21dID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlbGF0aXZlID0gdGhpcy5yZWxhdGl2ZShmcm9tKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0U291cmNlQ29udGVudChyZWxhdGl2ZSwgbm9kZS5zb3VyY2UuaW5wdXQuY3NzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFwcGx5UHJldk1hcHMoKSB7XG4gICAgICAgIGZvciAoIGxldCBwcmV2IG9mIHRoaXMucHJldmlvdXMoKSApIHtcbiAgICAgICAgICAgIGxldCBmcm9tID0gdGhpcy5yZWxhdGl2ZShwcmV2LmZpbGUpO1xuICAgICAgICAgICAgbGV0IHJvb3QgPSBwcmV2LnJvb3QgfHwgcGF0aC5kaXJuYW1lKHByZXYuZmlsZSk7XG4gICAgICAgICAgICBsZXQgbWFwO1xuXG4gICAgICAgICAgICBpZiAoIHRoaXMubWFwT3B0cy5zb3VyY2VzQ29udGVudCA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgICAgICAgbWFwID0gbmV3IG1vemlsbGEuU291cmNlTWFwQ29uc3VtZXIocHJldi50ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAoIG1hcC5zb3VyY2VzQ29udGVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnNvdXJjZXNDb250ZW50ID0gbWFwLnNvdXJjZXNDb250ZW50Lm1hcCggKCkgPT4gbnVsbCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFwID0gcHJldi5jb25zdW1lcigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm1hcC5hcHBseVNvdXJjZU1hcChtYXAsIGZyb20sIHRoaXMucmVsYXRpdmUocm9vdCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNBbm5vdGF0aW9uKCkge1xuICAgICAgICBpZiAoIHRoaXMuaXNJbmxpbmUoKSApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2YgdGhpcy5tYXBPcHRzLmFubm90YXRpb24gIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwT3B0cy5hbm5vdGF0aW9uO1xuICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLnByZXZpb3VzKCkubGVuZ3RoICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJldmlvdXMoKS5zb21lKCBpID0+IGkuYW5ub3RhdGlvbiApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRBbm5vdGF0aW9uKCkge1xuICAgICAgICBsZXQgY29udGVudDtcblxuICAgICAgICBpZiAoIHRoaXMuaXNJbmxpbmUoKSApIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSAnZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCwnICtcbiAgICAgICAgICAgICAgICAgICAgICAgQmFzZTY0LmVuY29kZSggdGhpcy5tYXAudG9TdHJpbmcoKSApO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiB0aGlzLm1hcE9wdHMuYW5ub3RhdGlvbiA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gdGhpcy5tYXBPcHRzLmFubm90YXRpb247XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLm91dHB1dEZpbGUoKSArICcubWFwJztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlb2wgICA9ICdcXG4nO1xuICAgICAgICBpZiAoIHRoaXMuY3NzLmluZGV4T2YoJ1xcclxcbicpICE9PSAtMSApIGVvbCA9ICdcXHJcXG4nO1xuXG4gICAgICAgIHRoaXMuY3NzICs9IGVvbCArICcvKiMgc291cmNlTWFwcGluZ1VSTD0nICsgY29udGVudCArICcgKi8nO1xuICAgIH1cblxuICAgIG91dHB1dEZpbGUoKSB7XG4gICAgICAgIGlmICggdGhpcy5vcHRzLnRvICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmUodGhpcy5vcHRzLnRvKTtcbiAgICAgICAgfSBlbHNlIGlmICggdGhpcy5vcHRzLmZyb20gKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZSh0aGlzLm9wdHMuZnJvbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ3RvLmNzcyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZW5lcmF0ZU1hcCgpIHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVN0cmluZygpO1xuICAgICAgICBpZiAoIHRoaXMuaXNTb3VyY2VzQ29udGVudCgpICkgICAgdGhpcy5zZXRTb3VyY2VzQ29udGVudCgpO1xuICAgICAgICBpZiAoIHRoaXMucHJldmlvdXMoKS5sZW5ndGggPiAwICkgdGhpcy5hcHBseVByZXZNYXBzKCk7XG4gICAgICAgIGlmICggdGhpcy5pc0Fubm90YXRpb24oKSApICAgICAgICB0aGlzLmFkZEFubm90YXRpb24oKTtcblxuICAgICAgICBpZiAoIHRoaXMuaXNJbmxpbmUoKSApIHtcbiAgICAgICAgICAgIHJldHVybiBbdGhpcy5jc3NdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFt0aGlzLmNzcywgdGhpcy5tYXBdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVsYXRpdmUoZmlsZSkge1xuICAgICAgICBpZiAoIC9eXFx3KzpcXC9cXC8vLnRlc3QoZmlsZSkgKSByZXR1cm4gZmlsZTtcblxuICAgICAgICBsZXQgZnJvbSA9IHRoaXMub3B0cy50byA/IHBhdGguZGlybmFtZSh0aGlzLm9wdHMudG8pIDogJy4nO1xuXG4gICAgICAgIGlmICggdHlwZW9mIHRoaXMubWFwT3B0cy5hbm5vdGF0aW9uID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICAgIGZyb20gPSBwYXRoLmRpcm5hbWUoIHBhdGgucmVzb2x2ZShmcm9tLCB0aGlzLm1hcE9wdHMuYW5ub3RhdGlvbikgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpbGUgPSBwYXRoLnJlbGF0aXZlKGZyb20sIGZpbGUpO1xuICAgICAgICBpZiAoIHBhdGguc2VwID09PSAnXFxcXCcgKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNvdXJjZVBhdGgobm9kZSkge1xuICAgICAgICBpZiAoIHRoaXMubWFwT3B0cy5mcm9tICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFwT3B0cy5mcm9tO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmUobm9kZS5zb3VyY2UuaW5wdXQuZnJvbSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZW5lcmF0ZVN0cmluZygpIHtcbiAgICAgICAgdGhpcy5jc3MgPSAnJztcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgbW96aWxsYS5Tb3VyY2VNYXBHZW5lcmF0b3IoeyBmaWxlOiB0aGlzLm91dHB1dEZpbGUoKSB9KTtcblxuICAgICAgICBsZXQgbGluZSAgID0gMTtcbiAgICAgICAgbGV0IGNvbHVtbiA9IDE7XG5cbiAgICAgICAgbGV0IGxpbmVzLCBsYXN0O1xuICAgICAgICB0aGlzLnN0cmluZ2lmeSh0aGlzLnJvb3QsIChzdHIsIG5vZGUsIHR5cGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY3NzICs9IHN0cjtcblxuICAgICAgICAgICAgaWYgKCBub2RlICYmIHR5cGUgIT09ICdlbmQnICkge1xuICAgICAgICAgICAgICAgIGlmICggbm9kZS5zb3VyY2UgJiYgbm9kZS5zb3VyY2Uuc3RhcnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZE1hcHBpbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiAgICB0aGlzLnNvdXJjZVBhdGgobm9kZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZWQ6IHsgbGluZSwgY29sdW1uOiBjb2x1bW4gLSAxIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbDogIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lOiAgIG5vZGUuc291cmNlLnN0YXJ0LmxpbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBub2RlLnNvdXJjZS5zdGFydC5jb2x1bW4gLSAxXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZE1hcHBpbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiAgICAnPG5vIHNvdXJjZT4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6ICB7IGxpbmU6IDEsIGNvbHVtbjogMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVkOiB7IGxpbmUsIGNvbHVtbjogY29sdW1uIC0gMSB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGluZXMgPSBzdHIubWF0Y2goL1xcbi9nKTtcbiAgICAgICAgICAgIGlmICggbGluZXMgKSB7XG4gICAgICAgICAgICAgICAgbGluZSAgKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxhc3QgICA9IHN0ci5sYXN0SW5kZXhPZignXFxuJyk7XG4gICAgICAgICAgICAgICAgY29sdW1uID0gc3RyLmxlbmd0aCAtIGxhc3Q7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbHVtbiArPSBzdHIubGVuZ3RoO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIG5vZGUgJiYgdHlwZSAhPT0gJ3N0YXJ0JyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIG5vZGUuc291cmNlICYmIG5vZGUuc291cmNlLmVuZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTWFwcGluZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6ICAgIHRoaXMuc291cmNlUGF0aChub2RlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlZDogeyBsaW5lLCBjb2x1bW46IGNvbHVtbiAtIDEgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsOiAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmU6ICAgbm9kZS5zb3VyY2UuZW5kLmxpbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBub2RlLnNvdXJjZS5lbmQuY29sdW1uXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZE1hcHBpbmcoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiAgICAnPG5vIHNvdXJjZT4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWw6ICB7IGxpbmU6IDEsIGNvbHVtbjogMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVkOiB7IGxpbmUsIGNvbHVtbjogY29sdW1uIC0gMSB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2VuZXJhdGUoKSB7XG4gICAgICAgIHRoaXMuY2xlYXJBbm5vdGF0aW9uKCk7XG5cbiAgICAgICAgaWYgKCB0aGlzLmlzTWFwKCkgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU1hcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgICAgICAgICAgdGhpcy5zdHJpbmdpZnkodGhpcy5yb290LCBpID0+IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gaTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIFtyZXN1bHRdO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
