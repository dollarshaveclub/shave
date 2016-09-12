function Truncated(selector, maxHeight, cName) {
  const content = document.querySelectorAll(selector);
  const classname = typeof cName !== 'undefined' ? cName : 'js-truncated';
  if (content.length <= 0) return false;
  for (let i = 0; i < content.length; i++) {
    const text = content[i];
     // exit early if we we don't need truncation
    if (text.offsetHeight < maxHeight) {
      if (text.classList.contains(classname)) {
        text.classList.remove(classname);
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

export default function (selector, maxHeight, cName) {
  return new Truncated(selector, maxHeight, cName);
}
