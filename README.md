
🚨 &nbsp;**This currently an untested project.** Updates will be coming 9/11/16. 🙌

## Truncated.js

Truncated.js is a javascript plugin that shortens text strings based on a specified max-height & adds an ellipsis at the end.

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
truncated('selector', num);🔥
```

### Basic Examples

**Basic**
```javascript
// plain js version
truncated('selector', num);
// jquery version
$('selector').truncated(num);
```

**Or Multiples**
```javascript
// plain js version
truncated('selector', num);
// jquery version
$('selector').truncated(num);
```

**But not this one**
```javascript
truncated('selector:not([not this selector])', num);
// jquery version
$('selector:not([not this selector])').truncated(num);
```

### How?

**Trucated.js** trims a text string to a last full word of what can fit within a specified max height.

### Why?

**Truncated.js** is done because of a need for simpicity when it comes to text truncation. Several plugins that I've reviewed oversolve the issue for what people want when they want text truncation - _for text to look nice in a specified space_. 

This plugin is small - `~1kb` unminified & is meant to do 1 thing - _truncate text based on a specified max height_. 

