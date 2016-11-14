/* global QUnit, shave, $ */

QUnit.test('select a paragraph with a class', function(assert) {
  shave('.test', 50);
  assert.equal(document.querySelectorAll('.js-shave').length, 1, 'there should be 1 .js-shave');
});

QUnit.test('select a paragraph with an id & unique class', function(assert) {
  shave('#test', 70, { classname: 'js-test' });
  assert.equal(document.querySelectorAll('.js-test').length, 1,
    'there should be 1 .js-test');
});

QUnit.test('select a paragraph with an id & no class & a special hellip', function(assert) {
  shave('#test-2', 70, { character: '🐔', classname: 'js-chicken' });
  assert.equal(document.querySelectorAll('.js-chicken').length, 1,
    'there should be 1 .js-chicken');
});

QUnit.test('select a paragraph with an id & no class & a special hellip', function(assert) {
  shave('#test-3', 90, { character: '👌', classname: 'js-new-text' });
  assert.equal(document.querySelectorAll('.js-new-text').length, 1,
    'there should be 1 .js-new-text');
});

QUnit.test('check shave iteration', function(assert) {
  shave('.test-2', 50, { character: '🙌', classname: 'js-iteration-works' });
  assert.equal(document.querySelectorAll('.js-iteration-works').length, 4,
    'there should be 4 .js-iteration-works');
});

QUnit.test('check shave with non-spaced languages', function(assert) {
  shave('.test-3', 50, { character: '...', classname: 'js-non-spaced-lang', spaces: false });
  assert.equal(document.querySelectorAll('.js-non-spaced-lang').length, 2,
    'there should be 2 .js-non-spaced-lang');
});

QUnit.test('check jquery and zepto or jquery', function(assert) {
  $('#test-4').shave(50, { classname: 'js-jquery-shave' });
  assert.equal(document.querySelectorAll('.js-jquery-shave').length, 1,
    'jQuery or Zepto should have been run.');
});

QUnit.test('check jquery chaining', function(assert) {
  $('#test-5').shave(50).css('height', '50px');
  assert.equal($('#test-5').css('height'), '50px',
    'jQuery or Zepto should have been run.');
});
