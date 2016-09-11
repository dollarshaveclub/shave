QUnit.test("select a paragraph with an id", function(assert) {
  truncated('#paragraph');
  assert.equal(document.querySelectorAll('.js-truncated').length, 1, 'there should be 1 truncated thing');
});
QUnit.test("test that text is truncated", function(assert) {
  truncated('.paragraph:not([title="not this one"])');
  assert.equal(document.querySelectorAll('.js-truncated').length, 3, 'there are 2 truncated items');
});
