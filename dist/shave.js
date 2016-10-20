(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.shave = factory());
}(this, (function () { 'use strict';

function shave(target, maxHeight, symbol, cName) {
  var els = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in els)) {
    els = [els];
  }
  var hellip = symbol || '&hellip;';
  var classname = cName || 'js-shave';
  var hellipWrap = '<span class="js-hellip">' + hellip + '</span>';
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var span = el.querySelector(classname);
    if (el.offsetHeight < maxHeight && span) {
      el.removeChild(el.querySelector('.js-hellip'));
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
    el.insertAdjacentHTML('beforeend', hellipWrap + '<span class="' + classname + '" style="display:none;">' + diff + '</span>');
    return;
  }
}
var plugin = window.$ || window.jQuery || window.Zepto;
if (plugin) {
  plugin.fn.extend({
    shave: function shaveFunc(maxHeight, symbol, cName) {
      return shave(this, maxHeight, symbol, cName);
    }
  });
}

return shave;

})));