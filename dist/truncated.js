(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.truncated = factory());
}(this, (function () { 'use strict';

function truncated(target, maxHeight, symbol, cName) {
  var els = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in els)) {
    els = [els];
  }
  var hellip = symbol || '&hellip;';
  var classname = cName || 'js-truncated';
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    if (el.offsetHeight < maxHeight) {
      var span = el.querySelector(classname);
      if (span) {
        el.removeChild(span);
      }
      return;
    }
    var text = el.textContent;
    var trimmedText = text;
    do {
      var lastSpace = trimmedText.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedText = trimmedText.substr(0, lastSpace);
    } while (text.offsetHeight > maxHeight);
    var k = 0;
    var diff = '';
    for (var j = 0; j < text.length; j++) {
      if (trimmedText[k] !== text[j] || i === trimmedText.length) {
        diff += text[j];
      } else {
        k++;
      }
    }
    el.insertAdjacentHTML('beforeend', hellip + '<span class="' + classname + '" style="display:none;">' + diff + '</span>');
    return;
  }
}
var plugin = window.$ || window.jQuery || window.Zepto;
if (plugin) {
  plugin.fn.extend({
    truncated: function truncatedFunc(maxHeight, symbol, cName) {
      return truncated(this, maxHeight, symbol, cName);
    }
  });
}

return truncated;

})));