$(document).ready(function(){
  var $window = $(window);
  var timer = null;
  var runShave = function() {

    if ($window.width() > 768) {
      shave('#demo-text', 150, {character: '...🐔 (Shave works!)'});
    } else {
      shave('#demo-text', 80, {character: '...🐔 (Shave works!)'});
    }
  };
  runShave();
  $window.on('resize', function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      runShave();
    }, 1000);
  });
});
