var path = require('path');
var relative = require('require-relative');
var serialize = require('./lib/serialize');
var getFlattenedPlugins = require('./lib/flatten');

// strip a nested module path + filename down to just the innermost module's (file)name
function getModuleName(path) {
	return path.replace(/(?:..\/)*(?:(?:.+[\\/])?node_modules[\\/]|[\\/]|\.\.[\\/])((@[^\\/]+[\\/])?[^\\/]+)([\\/].*)?$/g, '$1');
}


function setHiddenProp(obj, prop, value) {
	if (Object.defineProperty) {
		Object.defineProperty(obj, prop, {
			enumerable: false,
			writable: true,
			value: value
		});
	}
	else {
		obj[prop] = value;
	}
}


function extend(base, props) {
	for (var i in props) if (props.hasOwnProperty(i)) {
		base[i] = props[i];
	}
	return base;
}


function requireBabelPlugin(name, relativeTo) {
	if (!name.match(/^babel-plugin-/)) {
		name = 'babel-plugin-' + name;
	}

	var relativeName;
	if (relativeTo) {
		try {
			relativeName = relative.resolve(name, relativeTo);
		} catch (err) {}
	}
	if (!relativeName) {
		try {
			relativeName = require.resolve(name);
		} catch(err) {}
	}

	name = relativeName || name;

	return { mod:require(name), name:name };
}


module.exports = function(presetInput, modifications) {
	var options = {};

	if (Array.isArray(presetInput)) {
		options = presetInput[1];
		presetInput = presetInput[0];
	}
	modifications = modifications || {};

	var preset;
	if (typeof presetInput==='string') {
		if (!presetInput.match(/(^babel-preset-|[\\/])/)) {
			try {
				preset = relative.resolve('babel-preset-'+presetInput);
			} catch(err) {
				console.log(err);
			}
		}
		if (!preset) {
			preset = require.resolve(presetInput);
		}
	}

	preset = path.resolve(preset);

	var presetModule = require(preset);
	if (typeof presetModule==='function') {
		presetModule = presetModule({}, options);
	}

	var orig = presetModule['modify-babel-preset'];
	if (orig) {
		console.log('Found nested modify-babel-preset configuration, flattening.');
		return modify(orig.preset, extend(extend({}, orig.modifications), modifications));
	}

	var cwd = path.dirname(preset) || process.cwd();

	// console.log('cwd: ', cwd);

	var serialized = serialize(preset, {
		options: options,
		cwd: cwd
	});

	var plugins = getFlattenedPlugins(serialized);

	function isSameName(a, b) {
		if (typeof a!=='string' || typeof b!=='string') return false;
		return a.replace(/^babel-plugin-/i, '').toLowerCase() === b.replace(/^babel-plugin-/i, '').toLowerCase();
	}

	function indexOf(plugins, key) {
		for (var i=plugins.length; i--; ) {
			var mod = Array.isArray(plugins[i]) ? plugins[i][0] : plugins[i];
			var name = typeof mod==='string' && getModuleName(mod) || mod._original_name;
			if (isSameName(name, key)) {
				return i;
			}
		}
		return -1;
	}

	Object.keys(modifications).forEach(function(key) {
		if (key==='nameDrops' || key==='string') return;

		var value = modifications[key],
			index = indexOf(plugins, key);
		if (value===false) {
			if (index!==-1) {
				plugins.splice(index, 1);
			}
			else if (process.env.NODE_ENV==='development') {
				console.warn(key+' not found', __dirname);
			}
		}
		else {
			var imported = requireBabelPlugin(key, cwd),
				p = imported.mod;
			setHiddenProp(p, '_original_name', imported.name);
			if (value!==true) {
				p = [p].concat(value);
			}
			if (index<0) {
				plugins.push(p);
			}
			else {
				plugins[index] = p;
			}
		}
	});

	if (modifications.string!==true) {
		plugins = plugins.map(function(plugin) {
			var mod = Array.isArray(plugin) ? plugin[0] : plugin;
			if (typeof mod==='string') {
				var p = path.resolve(cwd, mod);
				mod = require(p);
				setHiddenProp(mod, '_original_name', p);
			}
			return Array.isArray(plugin) ? [mod].concat(plugin.slice(1)) : mod;
		});
	}

	var out = { plugins:plugins };

	setHiddenProp(out, 'modify-babel-preset', {
		preset: path.dirname(path.resolve(preset)),
		modifications: modifications
	});

	return out;
};
