(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.shave = factory());
}(this, (function () { 'use strict';

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
    if (el.offsetHeight < maxHeight) break;

    var fullText = el.textContent;
    var trimmedText = fullText;
    var lastSpace = void 0;

    do {
      lastSpace = trimmedText.lastIndexOf(' ');
      if (lastSpace < 0) break; // single word is too tall, do nothing
      trimmedText = trimmedText.slice(0, lastSpace);
      el.textContent = trimmedText;
      el.insertAdjacentHTML('beforeend', charHtml);
    } while (el.offsetHeight > maxHeight);

    var diff = fullText.slice(lastSpace);

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
