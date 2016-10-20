[![npm version 0.0.4](https://badge.fury.io/js/truncated.js.svg)](https://www.npmjs.com/package/dollarshaveclub/shave)
[![Bower version 0.0.2](https://badge.fury.io/bo/truncated.js.svg)](https://github.com/yowainwright/dollarshaveclub/shave)

# Shave

> A text truncation plugin that doesn't get in the way.

## Setup

```terminal
npm i shave --save-dev
```
```terminal
bower i shave --save-dev
```

## Run

1. Add **dist/shave.js**.
3. `shave` text within the element you'd like to.

```javascript
shave('selector', maxHeight);🔥
```

## Basic Examples

**Basic**
```javascript
shave('selector', maxHeight);
```

**Or Multiples**
```javascript
shave('selector', maxHeight);
```

**But not this one**
```javascript
shave('selector:not([not this selector])', maxHeight);
```
**With a special symbol**
```javascript
shave('selector', maxHeight, '🍻');
```

**With a special CSS Class**
```javascript
shave('selector', maxHeight, '🙌', 'your-css-class');
```

**Or with jQuery**
```javascript
$('selector').shave(maxHeight);
```

## How?

**Shave.js** trims an element's text string to the last full word that can fit within a specified max height.

## Why?

**Shave.js** is made for simpicity; it doesn't try to oversolve truncation or provide tons of options. It truncates text to a specified max height.

## What about the original text?

**Shave.js** re-adds the _diff_ of the original selected elements's text in a hidden `<span>`. It runs a check for that `<span>` to make sure text is truncated as desired every time.

## What about size?

**Shave.js** is small - `~1.5kb` unminified and is meant to do 1 thing - _truncate text to fit beautifully to a specified max height_.

## How can I use it?

You can use **Shave.js** in all modern formats and as a `jQuery` or `zepto` plugin.
