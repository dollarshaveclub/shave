QUnit.test("select an paragraph with an Id", function(assert) {
  $('#paragraph').truncated();
  assert.equal($('.js-truncated').length, 1, 'there is 1 truncated paragraph');
});
QUnit.test("test that truncated ran & didnt select one", function(assert) {
  $('.truncated:not([title="not this one"])').truncated();
  assert.equal($('.js-truncated').length, 3, 'there are 2 truncated paragraphs');
});
