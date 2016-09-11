'use strict'

/**
 * Is true when generators are supported.
 */
exports.support = false;

try {
  eval("(function *(){})()");
  exports.support = true;
} catch(err) {}

/**
 * Returns true if function is a generator fn.
 *
 * @param {Function} fn
 * @return {Boolean}
 */
exports.isGeneratorFn = function(fn) {
    return fn.constructor.name == 'GeneratorFunction';
}
