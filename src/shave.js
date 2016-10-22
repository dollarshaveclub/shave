export default function shave(target, maxheight, opts) {
  let els = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in els)) {
    els = [els];
  }
  if (!maxheight) {
    throw Error('maxHeight is required');
  }
  const hasOpts = typeof opts !== 'undefined';
  const defaults = {
    character: hasOpts && opts.character ? opts.character : '&hellip;',
    classname: hasOpts && opts.classname ? opts.classname : 'js-shave',
  };
  const shaveCharWrap = `<span class="js-shave-char">${defaults.character}</span>`;
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const span = el.querySelector(`.${defaults.classname}`);
    if (span) {
      el.removeChild(el.querySelector('.js-shave-char'));
      const replacedtext = el.textContent;
      el.removeChild(span);
      el.textContent = replacedtext;
    }
    if (el.offsetHeight < maxheight) return;
    const text = el.textContent;
    let trimmedText = text;
    do {
      const lastSpace = trimmedText.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedText = trimmedText.substr(0, lastSpace);
      el.textContent = trimmedText;
    } while (el.offsetHeight > maxheight);
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
      `${shaveCharWrap}<span class="${defaults.classname}" style="display:none;">${diff}</span>`
    );
    return;
  }
}
const plugin = window.$ || window.jQuery || window.Zepto;
if (plugin) {
  plugin.fn.extend({
    shave: function shaveFunc(maxheight, opts) {
      return shave(this, maxheight, opts);
    },
  });
}
