var btn = document.getElementById('button');
console.log('here', btn);
var timer = null;
var runShave = function() {
  var demoText = document.getElementById('demo-text');
  var hasShave = demoText.querySelector('.js-shave');
  console.log(demoText, hasShave);
  if (hasShave) {
    shave(demoText, 1000, {character: '...🐔 (Shave works!)'});
  } else {
    shave(demoText, 80, {character: '...🐔 (Shave works!)'});
  }
};
btn.addEventListener('click', function() {
  console.log('test');
  clearTimeout(timer);
  timer = setTimeout(function() {
    runShave();
  }, 1000);
}, false);
