var modify = require('modify-babel-preset');

module.exports = modify('es2015', {
	// remove commonjs transform
	'transform-es2015-modules-commonjs': false,

	// add external helpers
	'external-helpers': true
});
