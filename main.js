var btn = document.getElementById('button')
    textEl = document.getElementById('demo-text'),
    textString = textEl.textContent;
btn.addEventListener('click', function() {
  var hasShave = textEl.querySelector('#demo-text .js-shave');
      console.log(textString);

  if (hasShave !== null) {
    textEl.textContent = textString;
    btn.textContent = 'Truncate Text ✁';
    return;
  }
  shave(textEl, 120);
  btn.textContent = 'Reset ⏎';
  return;
}, false);
