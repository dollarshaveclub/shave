var expect = require('chai').expect,
	requireRelative = require('require-relative'),
	modifyBabelPreset = require('..'),
	serializePreset = require('../lib/serialize'),
	es2015Preset = require('babel-preset-es2015')(),
	transform = requireRelative('babel-preset-es2015', 'babel-plugin-transform-es2015-typeof-symbol'),
	jsxCore = require('babel-plugin-transform-react-jsx'),
	jsx = require('./fixtures/two/node_modules/one/node_modules/babel-plugin-transform-react-jsx');

describe('modify-babel-preset', function() {
	it('should import string presets', function() {
		var out = modifyBabelPreset('babel-preset-es2015');
		expect(out).to.deep.equal(es2015Preset);
	});

	it('should import string presets without babel-preset- prefix', function() {
		var out = modifyBabelPreset('es2015');
		expect(out).to.deep.equal(es2015Preset);
	});

	it('should remove for false values', function() {
		var out = modifyBabelPreset('es2015', {
			'transform-es2015-typeof-symbol': false
		});
		expect(out.plugins).to.have.length(es2015Preset.plugins.length-1);
		expect(out.plugins).not.to.include(transform);
	});

	it('should add for true values', function() {
		var out = modifyBabelPreset('es2015', {
			// nameDrops: false,
			'transform-react-jsx': true
		});
		expect(out.plugins).to.deep.equal( es2015Preset.plugins.concat(jsxCore) );
	});

	it('should add values with config', function() {
		var out = modifyBabelPreset('es2015', {
			nameDrops: false,
			'transform-react-jsx': { pragma:'h' }
		});
		expect(out.plugins).to.deep.equal( es2015Preset.plugins.concat([
			[jsxCore, { pragma:'h' }]
		]) );
	});

	xit('should work recursively', function() {
		var one = require('./fixtures/two/node_modules/one');

		// var reference = serializePreset(require.resolve('babel-preset-es2015')).plugins.map( p => (
		// 	Array.isArray(p) ? [getModuleName(p[0])].concat(p.slice(1)) : getModuleName(p)
		// ));
		//
		// var actual = one.plugins.map( p => (
		// 	Array.isArray(p) ? [getModuleName(p[0]._original_name)].concat(p.slice(1)) : getModuleName(p._original_name)
		// ));
		//
		// // expect(reference).to.deep.equal(actual, 'Equal when serialized');
		//
		// actual.forEach( (actual, i) => {
		// 	if (actual!==reference[i]) {
		// 		console.log(i+'\n actual: '+ JSON.stringify(actual)+'\n    ref: '+ JSON.stringify(reference[i]));
		// 		console.log(' ===json? ', JSON.stringify(actual)===JSON.stringify(reference[i]));
		// 		//console.log(' ===func? ', one.plugins[i][0]===es2015Preset.plugins[i][0]);
		// 	}
		// });
		//
		// function getModuleName(path) {
		// 	return path.replace(/^(.+\/)?node_modules\/([^\/]+)(\/.*)?$/g, '$2');
		// }

		function stripNames(p) {
			if (Array.isArray(p)) delete p[0]._original_name;
			else delete p._original_name;
			return p;
		}

		var p = one.plugins.map(stripNames);

		expect(p).to.deep.equal( es2015Preset.plugins.concat([
			[jsx, { pragma:'h' }]
		]).map(function(p) {
			var fn = Array.isArray(p) ? p[0] : p;
			if (fn===transform || (fn._original_name && ~fn._original_name.indexOf('babel-plugin-transform-es2015-typeof-symbol'))) {
				return [fn, { loose:true }];
			}
			return p;
		}).map(stripNames) );

		console.log('one matched');

		var two = require('./fixtures/two');
		two.plugins.forEach(function(p) {
			var f = Array.isArray(p) ? p[0] : p;
			//delete p._original_name;
		});

		// delete transform._original_name;
		// delete jsx._original_name;

		var target = es2015Preset.plugins.concat([
			[jsx, { pragma:'z' }]
		]);
		target.splice(17, 1);
		two.plugins = two.plugins.map(p => p+'');
		target = target.map(p => p+'');
		// console.log(two.plugins[17]===target[17]);
		expect(two.plugins).to.deep.equal(target);
	});
});
