[![npm version 0.0.4](https://badge.fury.io/js/truncated.js.svg)](https://www.npmjs.com/package/truncated.js)
[![Bower version 0.0.2](https://badge.fury.io/bo/truncated.js.svg)](https://github.com/yowainwright/truncated.js)

## Truncated.js

Truncated.js is a javascript plugin that shortens a text string based on a specified max-height & adds an ellipsis at the end.

### Setup

```terminal
npm install truncated.js --save-dev
```
```terminal
bower install truncated.js --save-dev
```

### Run

1. Include **truncated.js** into your `vendor` file or in a `<script>` tag.
2. Add truncated `css/scss`  to your `css`.
3. `truncate` the element you'd like to give truncation to. 

```javascript
truncated('selector', maxHeight);🔥
```

### Basic Examples

**Basic**
```javascript
truncated('selector', maxHeight);
```

**Or Multiples**
```javascript
truncated('selector', maxHeight);
```

**But not this one**
```javascript
truncated('selector:not([not this selector])', maxHeight);
```

### How?

**Truncated.js** trims a text string to a last full word of what can fit within a specified max height.

### Why?

**Truncated.js** is made simpicity when it comes to text truncation. Several plugins that I've looked at oversolve what people want when they want text truncation - _for text to look nice in a specified space_. Here's a basic [example](http://codepen.io/yowainwright/pen/xEwNKJ) & with [jQuery](http://codepen.io/yowainwright/pen/VKvNGE).

This plugin is small - `~1kb` unminified & is meant to do 1 thing - _truncate text based on a specified max height_. 

### Options

If you'd like to not use the classname 'js-truncated', just use your own. 

```javascript
reframe('selector', 'classname');
```
### jQuery

You can use truncated with [jQuery](https://jquery.com/).

```javascript
$('selector').reframe(maxheight);
```
&, if you'd like to use a custom classname instead of 'js-truncated'

```javascript
$('selector').reframe(maxheight, 'classname');
```
