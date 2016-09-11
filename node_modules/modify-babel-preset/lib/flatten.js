module.exports = function flatten(preset) {
	var plugins = [].concat(preset.plugins || []);

	(preset.presets || []).forEach(function(child) {
		var children = flatten(child);
		if (children) plugins = plugins.concat(children);
	});

	return plugins;
};
