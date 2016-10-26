
export default function shave(target, maxHeight, opts) {
  if (!maxHeight) throw Error('maxHeight is required');
  let els = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in els)) els = [els];

  const defaults = {
    character: '…',
    classname: 'js-shave',
  };
  const character = opts && opts.character || defaults.character;
  const classname = opts && opts.classname || defaults.classname;
  const charHtml = `<span class="js-shave-char">${character}</span>`;

  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const span = el.querySelector(`.${classname}`);

    // If element text has already been shaved
    if (span) {
      // Remove the ellipsis to recapture the original text
      el.removeChild(el.querySelector('.js-shave-char'));
      el.textContent = el.textContent; // nuke span, recombine text
    }

    // If already short enough, we're done
    if (el.offsetHeight < maxHeight) break;

    const fullText = el.textContent;
    let trimmedText = fullText;
    let lastSpace;

    do {
      lastSpace = trimmedText.lastIndexOf(' ');
      if (lastSpace < 0) break; // single word is too tall, do nothing
      trimmedText = trimmedText.slice(0, lastSpace);
      el.textContent = trimmedText;
      el.insertAdjacentHTML('beforeend', charHtml);
    } while (el.offsetHeight > maxHeight);

    const diff = fullText.slice(lastSpace);

    el.insertAdjacentHTML('beforeend',
      `<span class="${classname}" style="display:none;">${diff}</span>`);
  }
}
const plugin = window.$ || window.jQuery || window.Zepto;
if (plugin) {
  plugin.fn.extend({
    shave: function shaveFunc(maxHeight, opts) {
      return shave(this, maxHeight, opts);
    },
  });
}
