(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.truncated = factory());
}(this, (function () { 'use strict';

function Truncated(selector, maxHeight, cName) {
  var content = document.querySelectorAll(selector);
  var classname = typeof cName !== 'undefined' ? cName : 'js-truncated';
  if (content.length <= 0) return false;
  for (var i = 0; i < content.length; i++) {
    var text = content[i];
    // exit early if we we don't need truncation
    if (text.offsetHeight < maxHeight) {
      if (text.classList.contains(classname)) {
        text.classList.remove(classname);
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

function truncated (selector, maxHeight, cName) {
  return new Truncated(selector, maxHeight, cName);
}

return truncated;

})));