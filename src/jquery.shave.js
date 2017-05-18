/* global document, window */
import shaver from './shaver';

export default function shave(target, maxHeight, opts) {
  let els = (typeof target === 'string') ? document.querySelectorAll(target) : target;
  if (!('length' in els)) els = [els];
  for (let i = 0; i < els.length; i += 1) {
    const el = els[i];
    shaver(el, maxHeight, opts);
  }
}

if (typeof window !== 'undefined') {
  const plugin = window.$ || window.jQuery || window.Zepto;
  if (plugin) {
    plugin.fn.shave = function shavePlugin(maxHeight, opts) {
      shave(this, maxHeight, opts);
      return this;
    };
  }
}
