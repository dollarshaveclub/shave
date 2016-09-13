function Truncated(target, maxHeight, cName) {
  let content = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in content)) {
    content = [content];
  }
  const classname = cName || 'js-truncated';
  for (let i = 0; i < content.length; i++) {
    const text = content[i];
     // exit early if we we don't need truncation
    if (text.offsetHeight < maxHeight) {
      const hasClass = text.classList.contains(classname);
      if (hasClass) {
        text.className = text.classList.remove(classname);
      }
      return false;
    }
    // truncate
    let trimmedtext = text.textContent;
    do {
      const lastSpace = trimmedtext.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedtext = trimmedtext.substr(0, lastSpace);
      text.textContent = trimmedtext;
    } while (text.offsetHeight > maxHeight);
    return text.classList.add(classname);
  }
  return this;
}

export default function (target, maxHeight, cName) {
  return new Truncated(target, maxHeight, cName);
}

if (window.$ || window.jQuery || window.Zepto) {
  window.$.fn.extend({
    truncated: function truncatedFunc(maxHeight, cName) {
      return new Truncated(this, maxHeight, cName);
    },
  });
}
