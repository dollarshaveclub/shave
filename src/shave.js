/* global document, window */
import shaver from './shaver';

export default function shave(target, maxHeight, opts) {
  const els = document.querySelectorAll(target);
  for (let i = 0; i < els.length; i += 1) {
    const el = els[i];
    shaver(el, maxHeight, opts);
  }
}
