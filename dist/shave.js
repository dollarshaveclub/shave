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
    classname: 'js-shave',
    spaces: true
  };
  var character = opts && opts.character || defaults.character;
  var classname = opts && opts.classname || defaults.classname;
  var spaces = opts && opts.spaces === false ? false : defaults.spaces;
  var charHtml = '<span class="js-shave-char">' + character + '</span>';

  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var span = el.querySelector('.' + classname);

    var textProp = el.textContent === undefined ? 'innerText' : 'textContent';

    // If element text has already been shaved
    if (span) {
      // Remove the ellipsis to recapture the original text
      el.removeChild(el.querySelector('.js-shave-char'));
      el[textProp] = el[textProp]; // nuke span, recombine text
    }

    var fullText = el[textProp];
    var words = spaces ? fullText.split(' ') : fullText;

    // If 0 or 1 words, we're done
    if (words.length < 2) continue;

    // Temporarily remove any CSS height for text height calculation
    var heightStyle = el.style.height;
    el.style.height = 'auto';
    var maxHeightStyle = el.style.maxHeight;
    el.style.maxHeight = 'none';

    // If already short enough, we're done
    if (el.offsetHeight <= maxHeight) {
      el.style.height = heightStyle;
      el.style.maxHeight = maxHeightStyle;
      continue;
    }

    // Binary search for number of words which can fit in allotted height
    var max = words.length - 1;
    var min = 0;
    var pivot = void 0;
    while (min < max) {
      pivot = min + max + 1 >> 1;
      el[textProp] = spaces ? words.slice(0, pivot).join(' ') : words.slice(0, pivot);
      el.insertAdjacentHTML('beforeend', charHtml);
      if (el.offsetHeight > maxHeight) max = spaces ? pivot - 1 : pivot - 2;else min = pivot;
    }

    el[textProp] = spaces ? words.slice(0, max).join(' ') : words.slice(0, max);
    el.insertAdjacentHTML('beforeend', charHtml);
    var diff = spaces ? words.slice(max).join(' ') : words.slice(max);

    el.insertAdjacentHTML('beforeend', '<span class="' + classname + '" style="display:none;">' + diff + '</span>');

    el.style.height = heightStyle;
    el.style.maxHeight = maxHeightStyle;
  }
}

if (typeof window !== 'undefined') {
  var plugin = window.$ || window.jQuery || window.Zepto;
  if (plugin) {
    plugin.fn.shave = function shavePlugin(maxHeight, opts) {
      shave(this, maxHeight, opts);
      return this;
    };
  }
}

return shave;

})));
