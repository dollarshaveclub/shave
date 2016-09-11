(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.reframe = factory());
}(this, (function () { 'use strict';

function Truncated(selector, maxHeight) {
  var content = document.querySelectorAll(selector);
  if (content.length <= 0) return false;
  for (var i = 0; i < content.length; i++) {
    var text = content[i];
    // exit early if we we don't need truncation
    if (text.offsetHeight < maxHeight) {
      if (text.classList.contains('js-trancated')) {
        text.classList.remove('js-trancated');
      }
      return false;
    }
    // truncate
    var textString = text.textContent;
    var trimmedtext = textString;
    do {
      var lastSpace = trimmedtext.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedtext = trimmedtext.substr(0, lastSpace);
      text.textContent = trimmedtext;
    } while (text.offsetHeight > maxHeight);
    return text.classList.addClass('js-truncated');
  }
  return this;
}

function truncated (selector, maxHeight) {
  return new Truncated(selector, maxHeight);
}

return truncated;

})));