'use strict';

exports.__esModule = true;

var _tokenize = require('./tokenize');

var _tokenize2 = _interopRequireDefault(_tokenize);

var _input = require('./input');

var _input2 = _interopRequireDefault(_input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HIGHLIGHT_THEME = {
    'brackets': [36, 39], // cyan
    'string': [31, 39], // red
    'at-word': [31, 39], // red
    'comment': [90, 39], // gray
    '{': [32, 39], // green
    '}': [32, 39], // green
    ':': [1, 22], // bold
    ';': [1, 22], // bold
    '(': [1, 22], // bold
    ')': [1, 22] // bold
};

function code(color) {
    return '\u001b[' + color + 'm';
}

function terminalHighlight(css) {
    var tokens = (0, _tokenize2.default)(new _input2.default(css), { ignoreErrors: true });
    var result = [];

    var _loop = function _loop() {
        if (_isArray) {
            if (_i >= _iterator.length) return 'break';
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) return 'break';
            _ref = _i.value;
        }

        var token = _ref;

        var color = HIGHLIGHT_THEME[token[0]];
        if (color) {
            result.push(token[1].split(/\r?\n/).map(function (i) {
                return code(color[0]) + i + code(color[1]);
            }).join('\n'));
        } else {
            result.push(token[1]);
        }
    };

    for (var _iterator = tokens, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        var _ret = _loop();

        if (_ret === 'break') break;
    }
    return result.join('');
}

exports.default = terminalHighlight;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlcm1pbmFsLWhpZ2hsaWdodC5lczYiXSwibmFtZXMiOlsiSElHSExJR0hUX1RIRU1FIiwiY29kZSIsImNvbG9yIiwidGVybWluYWxIaWdobGlnaHQiLCJjc3MiLCJ0b2tlbnMiLCJpZ25vcmVFcnJvcnMiLCJyZXN1bHQiLCJ0b2tlbiIsInB1c2giLCJzcGxpdCIsIm1hcCIsImkiLCJqb2luIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsa0JBQWtCO0FBQ3BCLGdCQUFZLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FEUSxFQUNFO0FBQ3RCLGNBQVksQ0FBQyxFQUFELEVBQUssRUFBTCxDQUZRLEVBRUU7QUFDdEIsZUFBWSxDQUFDLEVBQUQsRUFBSyxFQUFMLENBSFEsRUFHRTtBQUN0QixlQUFZLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FKUSxFQUlFO0FBQ3RCLFNBQVksQ0FBQyxFQUFELEVBQUssRUFBTCxDQUxRLEVBS0U7QUFDdEIsU0FBWSxDQUFDLEVBQUQsRUFBSyxFQUFMLENBTlEsRUFNRTtBQUN0QixTQUFZLENBQUUsQ0FBRixFQUFLLEVBQUwsQ0FQUSxFQU9FO0FBQ3RCLFNBQVksQ0FBRSxDQUFGLEVBQUssRUFBTCxDQVJRLEVBUUU7QUFDdEIsU0FBWSxDQUFFLENBQUYsRUFBSyxFQUFMLENBVFEsRUFTRTtBQUN0QixTQUFZLENBQUUsQ0FBRixFQUFLLEVBQUwsQ0FWUSxDQVVFO0FBVkYsQ0FBeEI7O0FBYUEsU0FBU0MsSUFBVCxDQUFjQyxLQUFkLEVBQXFCO0FBQ2pCLFdBQU8sWUFBWUEsS0FBWixHQUFvQixHQUEzQjtBQUNIOztBQUVELFNBQVNDLGlCQUFULENBQTJCQyxHQUEzQixFQUFnQztBQUM1QixRQUFJQyxTQUFTLHdCQUFTLG9CQUFVRCxHQUFWLENBQVQsRUFBeUIsRUFBRUUsY0FBYyxJQUFoQixFQUF6QixDQUFiO0FBQ0EsUUFBSUMsU0FBUyxFQUFiOztBQUY0QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsWUFHbEJDLEtBSGtCOztBQUl4QixZQUFJTixRQUFRRixnQkFBZ0JRLE1BQU0sQ0FBTixDQUFoQixDQUFaO0FBQ0EsWUFBS04sS0FBTCxFQUFhO0FBQ1RLLG1CQUFPRSxJQUFQLENBQVlELE1BQU0sQ0FBTixFQUFTRSxLQUFULENBQWUsT0FBZixFQUNUQyxHQURTLENBQ0o7QUFBQSx1QkFBS1YsS0FBS0MsTUFBTSxDQUFOLENBQUwsSUFBaUJVLENBQWpCLEdBQXFCWCxLQUFLQyxNQUFNLENBQU4sQ0FBTCxDQUExQjtBQUFBLGFBREksRUFFVFcsSUFGUyxDQUVKLElBRkksQ0FBWjtBQUdILFNBSkQsTUFJTztBQUNITixtQkFBT0UsSUFBUCxDQUFZRCxNQUFNLENBQU4sQ0FBWjtBQUNIO0FBWHVCOztBQUc1Qix5QkFBbUJILE1BQW5CLGtIQUE0QjtBQUFBOztBQUFBOztBQUFBO0FBUzNCO0FBQ0QsV0FBT0UsT0FBT00sSUFBUCxDQUFZLEVBQVosQ0FBUDtBQUNIOztrQkFFY1YsaUIiLCJmaWxlIjoidGVybWluYWwtaGlnaGxpZ2h0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHRva2VuaXplIGZyb20gJy4vdG9rZW5pemUnO1xuaW1wb3J0IElucHV0ICAgIGZyb20gJy4vaW5wdXQnO1xuXG5jb25zdCBISUdITElHSFRfVEhFTUUgPSB7XG4gICAgJ2JyYWNrZXRzJzogWzM2LCAzOV0sIC8vIGN5YW5cbiAgICAnc3RyaW5nJzogICBbMzEsIDM5XSwgLy8gcmVkXG4gICAgJ2F0LXdvcmQnOiAgWzMxLCAzOV0sIC8vIHJlZFxuICAgICdjb21tZW50JzogIFs5MCwgMzldLCAvLyBncmF5XG4gICAgJ3snOiAgICAgICAgWzMyLCAzOV0sIC8vIGdyZWVuXG4gICAgJ30nOiAgICAgICAgWzMyLCAzOV0sIC8vIGdyZWVuXG4gICAgJzonOiAgICAgICAgWyAxLCAyMl0sIC8vIGJvbGRcbiAgICAnOyc6ICAgICAgICBbIDEsIDIyXSwgLy8gYm9sZFxuICAgICcoJzogICAgICAgIFsgMSwgMjJdLCAvLyBib2xkXG4gICAgJyknOiAgICAgICAgWyAxLCAyMl0gIC8vIGJvbGRcbn07XG5cbmZ1bmN0aW9uIGNvZGUoY29sb3IpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGNvbG9yICsgJ20nO1xufVxuXG5mdW5jdGlvbiB0ZXJtaW5hbEhpZ2hsaWdodChjc3MpIHtcbiAgICBsZXQgdG9rZW5zID0gdG9rZW5pemUobmV3IElucHV0KGNzcyksIHsgaWdub3JlRXJyb3JzOiB0cnVlIH0pO1xuICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKCBsZXQgdG9rZW4gb2YgdG9rZW5zICkge1xuICAgICAgICBsZXQgY29sb3IgPSBISUdITElHSFRfVEhFTUVbdG9rZW5bMF1dO1xuICAgICAgICBpZiAoIGNvbG9yICkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godG9rZW5bMV0uc3BsaXQoL1xccj9cXG4vKVxuICAgICAgICAgICAgICAubWFwKCBpID0+IGNvZGUoY29sb3JbMF0pICsgaSArIGNvZGUoY29sb3JbMV0pIClcbiAgICAgICAgICAgICAgLmpvaW4oJ1xcbicpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRva2VuWzFdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LmpvaW4oJycpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB0ZXJtaW5hbEhpZ2hsaWdodDtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
