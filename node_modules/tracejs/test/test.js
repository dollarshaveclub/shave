var assert = require('assert');

var fixture = require('./fixture/example');

var unnamed = fixture.unnamed,
    named = fixture.named;


var trace = require('../trace').trace;

var expected = 'random_'+~~(Math.random()*100);

var local_unnamed = function(text) {
  throw new Error(text);
};

try {
  local_unnamed(expected);
} catch(err) {
  var traced = trace(err);

  assert.ok(!!~['<anonymous>', 'local_unnamed'].indexOf(traced.frames[0].named_location));

  assert_stacks_equal(err, traced);
}

try {
  unnamed(expected);
} catch(err) {
  var traced = trace(err);
  assert_stacks_equal(err, traced);
}

try {
  named(expected);
} catch(err) {
  var traced = trace(err);
  assert_stacks_equal(err, traced);
}

(function () {
  var err = {
    stack:  "TypeError: Cannot read property 'toString' of undefined\n"+
            "    at /Users/merlyn/fun/pdxnode/node_modules/tracejs/trace.js:85:17\n"+
            "    at Array.map (native)\n"+
            "    at Trace.toString (/Users/merlyn/fun/pdxnode/node_modules/tracejs/trace.js:84:69)\n"+
            "    at Domain.<anonymous> (/Users/merlyn/fun/pdxnode/bot.js:8:27)\n"+
            "    at Domain.EventEmitter.emit (events.js:96:17)\n"+
            "    at process.uncaughtHandler (domain.js:61:20)\n"+
            "    at process.EventEmitter.emit (events.js:126:20)"
  };

  var traced = trace(err);
  assert_stacks_equal(err, traced);
})();

console.error('Tests passed');
return;

function assert_stacks_equal(err, traced) {
  assert.equal(traced.frames.length, err.stack.split('\n').length - 1);
  assert.equal(traced.first_line, err.stack.split('\n')[0]);
  assert.strictEqual(traced.original_error, err);

  var lines = err.stack.split('\n').slice(1);
  for(var i = 0, len = lines.length; i < len; ++i) {
    assert.ok(traced.frames[i], "Expected frame to be defined for line: '"+lines[i]+"'");
    if (!/\(native\)$/.test(lines[i])) {
      assert.notStrictEqual(lines[i].indexOf(traced.frames[i].line + ':' + traced.frames[i].character), -1);
    }
    assert.notStrictEqual(lines[i].indexOf(traced.frames[i].filename), -1);
  }
}
