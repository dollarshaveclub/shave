test('myMethod test', function() {
    equal(myMethod(), 123, 'myMethod returns right result');
});

test('myAsyncMethod test', function() {
    ok(true, 'myAsyncMethod started');

    stop();
    expect(2);

    myAsyncMethod(function(data) {
        equal(data, 123, 'myAsyncMethod returns right result');
        start();
    });
});
