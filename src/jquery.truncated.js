
(function truncatedFunc($) {
  $.fn.truncated = function truncatedFunc(maxHeight) {
    const $this = $(this);
    // exit early if we we don't need truncation
    if ($this.outerHeight() < maxHeight) {
      if ($this.hasClass('js-trancated')) {
        $this.text(text).removeClass('js-trancated');
      }
      return;
    }
    // truncate
    const text = $this.text();
    let trimmedtext = text;
    do {
      const lastSpace = trimmedtext.lastIndexOf(' ');
      if (lastSpace < 0) break;
      trimmedtext = trimmedtext.substr(0, lastSpace);
      $this.text(trimmedtext);
    } while ($this.outerHeight() > maxHeight);
    $this.addClass('js-truncated');
    return;
  };
}(jQuery));
