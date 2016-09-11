var path = require('path'),
	modify = require('../../../');

// module.exports = modify(path.resolve(__dirname+'/node_modules/one'), {
module.exports = modify(require.resolve('one'), {
	// nameDrops: false,
	'transform-es2015-typeof-symbol': false,
	'transform-react-jsx': { pragma:'z' },
});
