QUnit.test("select a paragraph with a class", function(assert) {
  truncated('.test', 50);
  assert.equal(document.querySelectorAll('.js-truncated').length, 1, 'there should be 1 truncated thing');
});
QUnit.test("select a paragraph with an id & unique class", function(assert) {
  truncated('#test', 70, '&hellip;', 'js-test');
  assert.equal(document.querySelectorAll('.js-test').length, 1, 'there should be 1 truncated thing with a class .js-test');
});
QUnit.test("select a paragraph with an id & no class & a special hellip", function(assert) {
  truncated('#test-2', 70, '🐔', 'js-chicken');
  assert.equal(document.querySelectorAll('.js-chicken').length, 1, 'there should be 1 truncated thing with a class .js-chicken');
});
QUnit.test("select a paragraph with an id & no class & a special hellip", function(assert) {
  truncated('#test-3', 90, '👌', 'js-new-text');
  assert.equal(document.querySelectorAll('.js-new-text').length, 1, 'there should be 1 truncated thing with a class .js-new-text');
});
