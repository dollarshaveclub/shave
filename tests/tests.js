QUnit.test("select a paragraph with a class", function(assert) {
  truncated('.test', 70);
  assert.equal(document.querySelectorAll('.js-truncated').length, 1, 'there should be 1 truncated thing');
});
