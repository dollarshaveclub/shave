
export default function shave(target, maxHeight, opts) {
  if (!maxHeight) throw Error('maxHeight is required');
  let els = typeof target === 'string' ? document.querySelectorAll(target) : target;
  if (!('length' in els)) els = [els];

  const defaults = {
    character: '…',
    classname: 'js-shave',
    spaces: true,
  };
  const character = opts && opts.character || defaults.character;
  const classname = opts && opts.classname || defaults.classname;
  const spaces = opts && opts.spaces === false ? false : defaults.spaces;
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
    if (el.offsetHeight < maxHeight) continue;

    const fullText = el.textContent;
    let words = fullText.split(' ');
    if (!spaces) words = el.textContent;
    // If 0 or 1 words, we're done
    if (words.length < 2) continue;
    // Binary search for number of words which can fit in allotted height
    let max = words.length - 1;
    let min = 0;
    let pivot;
    while (min < max) {
      pivot = (min + max + 1) >> 1;
      el.textContent = spaces ? words.slice(0, pivot).join(' ') : words.slice(0, pivot);
      el.insertAdjacentHTML('beforeend', charHtml);
      if (el.offsetHeight > maxHeight) max = pivot - 1;
      else min = pivot;
    }

    el.textContent = spaces ? words.slice(0, max).join(' ') : words.slice(0, max);
    el.insertAdjacentHTML('beforeend', charHtml);
    const diff = spaces ? words.slice(max + 1).join(' ') : words.slice(max + 1);

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
