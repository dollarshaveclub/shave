var btn = document.getElementById('button');
btn.addEventListener('click', function() {
  var text = document.getElementById('demo-text'),
      hasShave = text.querySelector('#demo-text .js-shave');
  if (hasShave !== null) {
    console.log('here');
    shave(text, 1000);
    return;
  }
  shave(text, 80, {character: '...🐔 (Shave works!)'});
  return;
}, false);
