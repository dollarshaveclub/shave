
# modify-babel-preset

[![npm](https://img.shields.io/npm/v/modify-babel-preset.svg)](http://npm.im/modify-babel-preset)
[![npm](https://img.shields.io/npm/dm/modify-babel-preset.svg)](http://npm.im/modify-babel-preset)
[![travis](https://travis-ci.org/developit/modify-babel-preset.svg?branch=master)](https://travis-ci.org/developit/modify-babel-preset)


Create a modified babel preset based on an an existing preset.

```sh
npm i -S modify-babel-preset
```


---


- [API](#api)
	- [Add/Update Plugins](#addupdate-plugins)
	- [Remove Plugins](#remove-plugins)
- [Example](#example)


  ---


## API

A single function that takes an existing preset name and a mapping of plugin modifications to apply to that preset.  _Make sure you have the preset and any added plugins installed as dependencies._

```js
newPreset = modifyBabelPreset(
	'existing-preset-name',
	{
		'plugin-name': false,  // remove
		'other-plugin': true,  // add
		'foo': { loose:true }  // add + config
	}
);
```

> Modification keys are babel plugin names _(you can exclude the `babel-plugin-` prefix)._


### Add/Update Plugins

To add a plugin, pass `true`, or a configuration object:

```js
{
	// just add a plugin without config:
	'plugin-name': true,

	// add a plugin and set its config
	'other-plugin': { loose:true }
}
```

> **Note:** adding a plugin that is already provided by the preset just overwrites its configuration.


### Remove Plugins

To remove a plugin, pass `false`:

```js
{
	'plugin-name': false
}
```


---


## Example

Here's a simple preset. Just this `index.js` and a package.json pointing to it with the preset and plugin installed as dependencies.

```js
var modifyBabelPreset = require('modify-babel-preset');

// just export the cloned, modified preset config:
module.exports = modifyBabelPreset('es2015', {

	// remove the typeof x==='symbol' transform:
	'transform-es2015-typeof-symbol': false,

	// add the JSX transform:
	'transform-react-jsx': true

});
```
