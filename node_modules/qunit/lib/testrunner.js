var fs = require('fs'),
    path = require('path'),
    coverage = require('./coverage'),
    cp = require('child_process'),
    _ = require('underscore'),
    log = exports.log = require('./log');

var options,
    noop = function() {};

options = exports.options = {

    // logging options
    log: {

        // log assertions overview
        assertions: true,

        // log expected and actual values for failed tests
        errors: true,

        // log tests overview
        tests: true,

        // log summary
        summary: true,

        // log global summary (all files)
        globalSummary: true,

        // log coverage
        coverage: true,

        // log global coverage (all files)
        globalCoverage: true,

        // log currently testing code file
        testing: true
    },

    // run test coverage tool
    coverage: false,

    // define dependencies, which are required then before code
    deps: null,

    // define namespace your code will be attached to on global['your namespace']
    namespace: null,

    // max amount of ms child can be blocked, after that we assume running an infinite loop
    maxBlockDuration: 2000
};

/**
 * Run one spawned instance with tests
 * @param {Object} opts
 * @param {Function} callback
 */
function runOne(opts, callback) {
    var child;
    var pingCheckTimeoutId;
    var argv = process.argv.slice();

    argv.push(JSON.stringify(opts));
    child = cp.fork(__dirname + '/child.js', argv, {env: process.env});

    function kill() {
        process.removeListener('exit', kill);
        child.kill();
    }

    function complete(err, data) {
        kill();
        clearTimeout(pingCheckTimeoutId);
        callback(err, data)
    }

    child.on('message', function(msg) {
        switch (msg.event) {
            case 'ping':
                clearTimeout(pingCheckTimeoutId);
                pingCheckTimeoutId = setTimeout(function() {
                    complete(new Error('Process blocked for too long'));
                }, opts.maxBlockDuration);
                break;
            case 'assertionDone':
                log.add('assertions', msg.data);
                break;
            case 'testDone':
                log.add('tests', msg.data);
                break;
            case 'done':
                clearTimeout(pingCheckTimeoutId);
                msg.data.code = opts.code.path;
                log.add('summaries', msg.data);
                if (opts.coverage) {
                    coverage.add(msg.data.coverage);
                    msg.data.coverage = coverage.get();
                    msg.data.coverage.code = msg.data.code;
                    log.add('coverages', msg.data.coverage);
                }
                if (opts.log.testing) {
                    console.log('done');
                }
                complete(null, msg.data);
                break;
            case 'uncaughtException':
                complete(_.extend(new Error(), msg.data));
                break;
        }
    });

    process.on('exit', kill);

    if (opts.log.testing) {
        console.log('\nTesting ', opts.code.path + ' ... ');
    }
}

/**
 * Make an absolute path from relative
 * @param {string|Object} file
 * @return {Object}
 */
function absPath(file) {
    if (typeof file === 'string') {
        file = {path: file};
    }

    if (file.path.charAt(0) != '/') {
        file.path = path.resolve(process.cwd(), file.path);
    }

    return file;
}

/**
 * Convert path or array of paths to array of abs paths
 * @param {Array|string} files
 * @return {Array}
 */
function absPaths(files) {
    var ret = [];

    if (Array.isArray(files)) {
        files.forEach(function(file) {
            ret.push(absPath(file));
        });
    } else if (files) {
        ret.push(absPath(files));
    }

    return ret;
}

/**
 * Run tests in spawned node instance async for every test.
 * @param {Object|Array} files
 * @param {Function} callback optional
 */
exports.run = function(files, callback) {
    var filesCount = 0;

    callback || (callback = noop);

    if (!Array.isArray(files)) {
        files = [files];
    }

    if (options.coverage || files[0].coverage) coverage.setup(options.coverage);

    files.forEach(function(file) {
        var opts = _.extend({}, options, file);

        !opts.log && (opts.log = {});
        opts.deps = absPaths(opts.deps);
        opts.code = absPath(opts.code);
        opts.tests = absPaths(opts.tests);

        runOne(opts, function(err, stat) {
            if (err) {
                return callback(err, log.stats());
            }

            filesCount++;

            if (filesCount >= files.length) {
                _.each(opts.log, function(val, name) {
                    if (val && log.print[name]) {
                        log.print[name]();
                    }
                });

                // Write coverage report.
                if (opts.coverage) coverage.report();
                callback(null, log.stats());
            }
        });
    });
};


/**
 * Set options
 * @param {Object}
 */
exports.setup = function(opts) {
    _.extend(options, opts);
};
