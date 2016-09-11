'use strict';

(function truncatedFunc($) {
  $.fn.truncated = function truncatedFunc(maxHeight) {
    var $this = $(this);
    // exit early if we we don't need truncation
    if ($this.outerHeight() < maxHeight) {
      if ($this.hasClass('js-trancated')) {
        $this.text(text).removeClass('js-trancated');
      }
      return;
    }
    // truncate
    var text = $this.text();
    var trimmedtext = text;
    do {
      var lastSpace = trimmedtext.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedtext = trimmedtext.substr(0, lastSpace);
      $this.text(trimmedtext);
    } while ($this.outerHeight() > maxHeight);
    $this.addClass('js-truncated');
    return;
  };
})(jQuery);