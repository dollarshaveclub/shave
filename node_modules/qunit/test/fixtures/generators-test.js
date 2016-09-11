test('generators', function* () {
    var data = yield thunk();
    deepEqual(data, {a: 1}, 'woks');
});
