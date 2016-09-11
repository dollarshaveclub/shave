"use strict";

exports.__esModule = true;

var _location = require("../util/location");

var _context = require("./context");

var _types = require("./types");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = function () {
  function State() {
    _classCallCheck(this, State);
  }

  State.prototype.init = function init(options, input) {
    this.strict = options.strictMode === false ? false : options.sourceType === "module";

    this.input = input;

    this.potentialArrowAt = -1;

    this.inMethod = this.inFunction = this.inGenerator = this.inAsync = false;

    this.labels = [];

    this.decorators = [];

    this.tokens = [];

    this.comments = [];

    this.trailingComments = [];
    this.leadingComments = [];
    this.commentStack = [];

    this.pos = this.lineStart = 0;
    this.curLine = 1;

    this.type = _types.types.eof;
    this.value = null;
    this.start = this.end = this.pos;
    this.startLoc = this.endLoc = this.curPosition();

    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;

    this.context = [_context.types.braceStatement];
    this.exprAllowed = true;

    this.containsEsc = this.containsOctal = false;
    this.octalPosition = null;

    return this;
  };

  // TODO


  // TODO


  // Used to signify the start of a potential arrow function


  // Flags to track whether we are in a function, a generator.


  // Labels in scope.


  // Leading decorators.


  // Token store.


  // Comment store.


  // Comment attachment store


  // The current position of the tokenizer in the input.


  // Properties of the current token:
  // Its type


  // For tokens that include more information than their type, the value


  // Its start and end offset


  // And, if locations are used, the {line, column} object
  // corresponding to those offsets


  // Position information for the previous token


  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.


  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.


  // TODO


  State.prototype.curPosition = function curPosition() {
    return new _location.Position(this.curLine, this.pos - this.lineStart);
  };

  State.prototype.clone = function clone(skipArrays) {
    var state = new State();
    for (var key in this) {
      var val = this[key];

      if ((!skipArrays || key === "context") && Array.isArray(val)) {
        val = val.slice();
      }

      state[key] = val;
    }
    return state;
  };

  return State;
}();

exports.default = State;