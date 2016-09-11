var fs = require('fs');
var path = require('path');
var requireRelative = require('require-relative');
var join = path.join;
var dirname = path.dirname;
var relative = path.relative;

function getModulePath(filepath) {
	return filepath.replace(/(.*([\\/]node_modules|\.\.)[\\/](@[^\\/]+[\\/])?[^\\/]+)([\\/].*)?$/g, '$1')
}

// Attempt to require a module, returning false on error
function req(name) {
	try {
		return require(name);
	} catch (err) {
		return false;
	}
}

// Attempt to resolve a module, returning `undefined` on error
function resolve(name, relativeTo) {
	var path = false;
	try {
		path = requireRelative.resolve(name, relativeTo);
	} catch (err) {
		console.log('resolve failed: ', err, name);
	}
	return path;
}

// Get a list of child module names for the given module path
function getChildren(path, type) {
	var modules;
	try {
		modules = fs.readdirSync(join(path, 'node_modules'));
	} catch (err) {
		path = path.replace(/([\\/]node_modules)([\\/].*)?$/g, '$1');
		modules = fs.readdirSync(path);
	}
	return (modules || [])
		.filter( realFile )
		.sort( reverseSorter(type==='plugin' ? isPlugin : isPreset) )
}

// is a filename an actual file
function realFile(f) {
	return f && f.charAt(0)!=='.';
}

// ascending sort based on the truthiness of a function
function reverseSorter(comparison) {
	return function(a, b) {
		var ca = comparison(a),
			cb = comparison(b);
		return ca===cb ? 0 : (ca ? 1 : cb ? -1 : 0);
	}
}

function isPreset(name) { return name && name.match(/^babel\-preset\-/g); }

function isPlugin(name) { return name && name.match(/^babel\-plugin\-/g); }

// find the matching module *instance* in a list of module paths, remove and return it
function findAndRemove(preset, path, list) {
	for (var i=list.length; i--; ) {
		var p = resolve(list[i], path),
			v = p && req(p);
		if (v && v===preset) {
			list.splice(i, 1);
			return p;
		}
	}
}

/** Resolve & serialize a Babel preset to a filename-based representation.
 *	Nested filepaths are relative to `relativeTo` if specified.
 *	Presets referenced as Strings (uncommon) are treated as dependencies of the preset that returned them.
 */
function loadPreset(name, opts, relativeTo) {
	var path = resolve(name, relativeTo),
		mod = path && req(path);
	if (typeof mod==='function') {
		mod = mod({}, opts.options || {});
	}
	if (!mod) throw new Error('Preset "'+name+'" not found.');

	path = dirname(path);

	var out = {};
	if (mod.presets) {
		var availablePresets = getChildren(path, 'preset');
		out.presets = mod.presets.map(function(preset) {
			if (typeof preset!=='string') {
				preset = findAndRemove(preset, path, availablePresets);
			}
			return loadPreset(preset, opts, path);
		});
	}

	if (mod.plugins) {
		var availablePlugins = getChildren(path, 'plugin');
		out.plugins = mod.plugins.map(function(plugin) {
			var name = Array.isArray(plugin) ? plugin[0] : plugin;
			if (typeof name!=='string') {
				if (name._original_name) {
					// console.log('using _original_name: ', name._original_name);
					name = name._original_name;
				}
				else {
					name = findAndRemove(name, path, availablePlugins);
				}
			}
			if (!name) return plugin;

			name = resolve(name, path);
			name = getModulePath(name);
			if (opts) {
				if (opts.cwd) name = relative(opts.cwd, name);
				if (opts.transform) name = opts.transform(name);
			}
			return Array.isArray(plugin) ? [name].concat(plugin.slice(1)) : name;
		});
	}

	return out;
}

module.exports = loadPreset;
