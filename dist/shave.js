(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.shave = factory());
}(this, (function () { 'use strict';

function shave(target, maxHeight, opts) {
  var els = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in els)) {
    els = [els];
  }
  var defaults = {
    character: '&hellip;',
    classname: 'js-shave'
  };
  if (typeof opts !== 'undefined') {
    defaults = opts;
  }
  var shaveCharWrap = '<span class="js-shave-char">' + defaults.character + '</span>';
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var span = el.querySelector(defaults.classname);
    if (el.offsetHeight < maxHeight && span) {
      el.removeChild(el.querySelector('.js-shave-char'));
      var _text = el.textContent;
      el.removeChild(span);
      el.textContent = _text;
      return;
    } else if (el.offsetHeight < maxHeight) return;
    var text = el.textContent;
    var trimmedText = text;
    do {
      var lastSpace = trimmedText.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedText = trimmedText.substr(0, lastSpace);
      el.textContent = trimmedText;
    } while (el.offsetHeight > maxHeight);
    var k = 0;
    var diff = '';
    for (var j = 0; j < text.length; j++) {
      if (trimmedText[k] !== text[j] || i === trimmedText.length) {
        diff += text[j];
      } else {
        k++;
      }
    }
    el.insertAdjacentHTML('beforeend', shaveCharWrap + '<span class="' + defaults.classname + '" style="display:none;">' + diff + '</span>');
    return;
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