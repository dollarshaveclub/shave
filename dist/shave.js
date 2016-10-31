(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.shave = factory());
}(this, (function () { 'use strict';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function shave(target, maxHeight, opts) {
  if (!maxHeight) throw Error('maxHeight is required');
  var els = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in els)) els = [els];

  var defaults = {
    character: '…',
    classname: 'js-shave'
  };
  var character = opts && opts.character || defaults.character;
  var classname = opts && opts.classname || defaults.classname;
  var charHtml = '<span class="js-shave-char">' + character + '</span>';

  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var span = el.querySelector('.' + classname);

    // If element text has already been shaved
    if (span) {
      // Remove the ellipsis to recapture the original text
      el.removeChild(el.querySelector('.js-shave-char'));
      el.textContent = el.textContent; // nuke span, recombine text
    }

    // If already short enough, we're done
    if (el.offsetHeight < maxHeight) continue;

    var fullText = el.textContent;
    // const words = fullText.split(' ');
    var words = [].concat(toConsumableArray(fullText));

    // If 0 or 1 words, we're done
    if (words.length < 2) continue;

    // Binary search for number of words which can fit in allotted height
    var max = words.length - 1;
    var min = 0;
    var pivot = void 0;
    while (min < max) {
      pivot = min + max + 1 >> 1;
      el.textContent = words.slice(0, pivot).join(' ');
      el.insertAdjacentHTML('beforeend', charHtml);
      if (el.offsetHeight > maxHeight) max = pivot - 1;else min = pivot;
    }

    el.textContent = words.slice(0, max).join(' ');
    el.insertAdjacentHTML('beforeend', charHtml);
    var diff = words.slice(max + 1).join(' ');

    el.insertAdjacentHTML('beforeend', '<span class="' + classname + '" style="display:none;">' + diff + '</span>');
  }
}

var plugin = window.$ || window.jQuery || window.Zepto;
if (plugin) {
  plugin.fn.extend({
    shave: function shaveFunc(maxHeight, opts) {
      return shave(this, maxHeight, opts);
    }
  });
}

return shave;

})));