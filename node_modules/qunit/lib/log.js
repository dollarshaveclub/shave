var Table = require('cli-table');

var data,
    log = console.log,
    fileColWidth = 50;

data = {
    assertions: [],
    tests: [],
    summaries: [],
    coverages: []
};

/**
 * Add data to the log report.
 *
 * @param {String} type
 * @param {Object} obj
 * @return {Array}
 */
exports.add = function(type, obj) {
    if (obj) {
        data[type].push(obj);
    }
    return data[type];
};

/**
 * Get global tests stats in unified format
 */
exports.stats = function() {
    var stats = {
        files: 0,
        assertions: 0,
        failed: 0,
        passed: 0,
        runtime: 0
    };

    data.summaries.forEach(function(file) {
        stats.files++;
        stats.assertions += file.total;
        stats.failed += file.failed;
        stats.passed += file.passed;
        stats.runtime += file.runtime;
    });

    stats.tests = data.tests.length;

    stats.coverage = {
        files: 0,
        statements: { covered: 0, total: 0 },
        branches: { covered: 0, total: 0 },
        functions: { covered: 0, total: 0 },
        lines: { covered: 0, total: 0 }
    };

    data.coverages.forEach(function(file) {
        stats.coverage.files++;
        stats.coverage.statements.covered += file.statements.covered;
        stats.coverage.statements.total += file.statements.total;
        stats.coverage.branches.covered += file.branches.covered;
        stats.coverage.branches.total += file.branches.total;
        stats.coverage.functions.covered += file.functions.covered;
        stats.coverage.functions.total += file.functions.total;
        stats.coverage.lines.covered += file.lines.covered;
        stats.coverage.lines.total += file.lines.total;
    });

    return stats;
};

/**
 * Reset global stats data
 */
exports.reset = function() {
    data = {
        assertions: [],
        tests: [],
        summaries: [],
        coverages: []
    };
};

var print = exports.print = {};

print.assertions = function() {
    var table,
        currentModule, module,
        currentTest, test;

    table = new Table({
        head: ['Module', 'Test', 'Assertion', 'Result']
    });

    data.assertions.forEach(function(data) {
        // just easier to read the table
        if (data.module === currentModule) {
            module = '';
        } else {
            module = currentModule = data.module;
        }

        // just easier to read the table
        if (data.test === currentTest) {
            test = '';
        } else {
            test = currentTest = data.test;
        }

        table.push([module, test, data.message || '', data.result ? 'ok' : 'fail']);
    });

    log('\nAssertions:\n' + table.toString());
};

print.errors = function() {
    var errors = [];

    data.assertions.forEach(function(data) {
        if (!data.result) {
            errors.push(data);
        }
    });

    if (errors.length) {
        log('\n\nErrors:');
        errors.forEach(function(data) {
            log('\nModule: ' + data.module + ' Test: ' + data.test);
            if (data.message) {
                log(data.message);
            }

            if (data.source) {
                log(data.source);
            }

            if (data.expected != null || data.actual != null) {
                //it will be an error if data.expected !== data.actual, but if they're
                //both undefined, it means that they were just not filled out because
                //no assertions were hit (likely due to code error that would have been logged as source or message).
                log('Actual value:');
                log(data.actual);
                log('Expected value:');
                log(data.expected);
            }
        });
    }
};

print.tests = function() {
    var table,
        currentModule, module;

    table = new Table({
        head: ['Module', 'Test', 'Failed', 'Passed', 'Total']
    });

    data.tests.forEach(function(data) {
        // just easier to read the table
        if (data.module === currentModule) {
            module = '';
        } else {
            module = currentModule = data.module;
        }

        table.push([module, data.name, data.failed, data.passed, data.total]);
    });

    log('\nTests:\n' + table.toString());
};

// truncate file name
function truncFile(code) {
    if (code && code.length > fileColWidth) {
        code = '...' + code.slice(code.length - fileColWidth + 3);
    }
    return code;
}

print.summary = function() {
    var table;

    table = new Table({
        head: ['File', 'Failed', 'Passed', 'Total', 'Runtime']
    });

    data.summaries.forEach(function(data) {
        table.push([truncFile(data.code), data.failed, data.passed, data.total, data.runtime]);
    });

    log('\nSummary:\n' + table.toString());
};

print.globalSummary = function() {
    var table,
        data = exports.stats();

    table = new Table({
        head: ['Files', 'Tests', 'Assertions', 'Failed', 'Passed', 'Runtime']
    });

    table.push([data.files, data.tests, data.assertions, data.failed,
        data.passed, data.runtime]);

    log('\nGlobal summary:\n' + table.toString());
};

function getMet(metric) {
    function percent(covered, total) {
        var tmp;
        if (total > 0) {
            tmp = 1000 * 100 * covered / total + 5;
            return Math.floor(tmp / 10) / 100;
        } else {
            return 100.00;
        }
    }
    if (!metric.pct) metric.pct = percent(metric.covered, metric.total);
    return metric.pct + '% (' + metric.covered + '/' + metric.total + ')';
}

print.coverage = function() {
    var table;

    if (!data.coverages.length) return;

    table = new Table({
        head: ['File', 'Statements', 'Branches', 'Functions', 'Lines']
    });

    data.coverages.forEach(function(coverage) {
        table.push([
            truncFile(coverage.code),
            getMet(coverage.statements),
            getMet(coverage.branches),
            getMet(coverage.functions),
            getMet(coverage.lines)]);
    });

    log('\nCoverage:\n' + table.toString());
};

print.globalCoverage = function() {
    var coverage, table;

    if (!data.coverages.length) return;

    coverage = exports.stats().coverage;
    table = new Table({
        head: ['Files', 'Statements', 'Branches', 'Functions', 'Lines']
    });

    table.push([
        coverage.files,
        getMet(coverage.statements),
        getMet(coverage.branches),
        getMet(coverage.functions),
        getMet(coverage.lines)
    ]);

    log('\nGlobal coverage:\n' + table.toString());
};
