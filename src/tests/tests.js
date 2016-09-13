QUnit.test("select a paragraph with an id", function(assert) {
  truncated('#test', 70);
  assert.equal(document.querySelectorAll('.js-truncated').length, 1, 'there should be 1 truncated thing');
});
QUnit.test("test that text is truncated", function(assert) {
  $('.test').truncated(70);
  assert.equal(document.querySelectorAll('.js-truncated').length, 2, 'there are 2 truncated items');
});
