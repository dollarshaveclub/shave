exports.thunk = function() {
    return function(callback) {
        setTimeout(function() {
            callback(null, {a: 1});
        }, 100);
    };
};
