export default function truncated(target, maxHeight, symbol, cName) {
  let els = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in els)) {
    els = [els];
  }
  const hellip = symbol || '&hellip;';
  const classname = cName || 'js-truncated';
  const hellipWrap = `<span class="js-hellip">${hellip}</span>`;
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const span = el.querySelector(classname);
    if (el.offsetHeight < maxHeight && span) {
      el.removeChild(el.querySelector('.js-hellip'));
      const text = el.textContent;
      el.removeChild(span);
      el.textContent = text;
      return;
    } else if (el.offsetHeight < maxHeight) return;
    const text = el.textContent;
    let trimmedText = text;
    do {
      const lastSpace = trimmedText.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedText = trimmedText.substr(0, lastSpace);
      el.textContent = trimmedText;
    } while (el.offsetHeight > maxHeight);
    let k = 0;
    let diff = '';
    for (let j = 0; j < text.length; j++) {
      if (trimmedText[k] !== text[j] || i === trimmedText.length) {
        diff += text[j];
      } else {
        k++;
      }
    }
    el.insertAdjacentHTML(
      'beforeend',
      `${hellipWrap}<span class="${classname}" style="display:none;">${diff}</span>`
    );
    return;
  }
}
const plugin = window.$ || window.jQuery || window.Zepto;
if (plugin) {
  plugin.fn.extend({
    truncated: function truncatedFunc(maxHeight, symbol, cName) {
      return truncated(this, maxHeight, symbol, cName);
    },
  });
}
