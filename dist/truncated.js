(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.truncated = factory());
}(this, (function () { 'use strict';

function Truncated(target, maxHeight, cName) {
  var content = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in content)) {
    content = [content];
  }
  var classname = cName || 'js-truncated';
  for (var i = 0; i < content.length; i++) {
    var text = content[i];
    // exit early if we we don't need truncation
    if (text.offsetHeight < maxHeight) {
      var hasClass = text.classList.contains(classname);
      if (hasClass) {
        text.className = text.classList.remove(classname);
      }
      return false;
    }
    // truncate
    var trimmedtext = text.textContent;
    do {
      var lastSpace = trimmedtext.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedtext = trimmedtext.substr(0, lastSpace);
      text.textContent = trimmedtext;
    } while (text.offsetHeight > maxHeight);
    return text.classList.add(classname);
  }
  return this;
}

function truncated (target, maxHeight, cName) {
  return new Truncated(target, maxHeight, cName);
}

if (window.$ || window.jQuery || window.Zepto) {
  window.$.fn.truncated = function truncatedFunc(maxHeight, cName) {
    return new Truncated(this, maxHeight, cName);
  };
}

return truncated;

})));