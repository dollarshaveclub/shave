function Truncated(selector, maxHeight) {
  const content = document.querySelectorAll(selector);
  if (content.length <= 0) return false;
  for (let i = 0; i < content.length; i++) {
    const text = content[i];
     // exit early if we we don't need truncation
    if (text.offsetHeight < maxHeight) {
      if (text.classList.contains('js-trancated')) {
        text.classList.remove('js-trancated');
      }
      return false;
    }
    // truncate
    const textString = text.textContent;
    let trimmedtext = textString;
    do {
      const lastSpace = trimmedtext.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedtext = trimmedtext.substr(0, lastSpace);
      text.textContent = trimmedtext;
    } while (text.offsetHeight > maxHeight);
    return text.classList.addClass('js-truncated');
  }
  return this;
}

export default function (selector, maxHeight) {
  return new Truncated(selector, maxHeight);
}
