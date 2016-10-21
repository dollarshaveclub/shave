![shave](https://cloud.githubusercontent.com/assets/1074042/19585160/fadce042-96fe-11e6-9959-3d5bfe8a52dd.jpg)

[![npm version 0.0.3](https://badge.fury.io/js/shave.svg)](https://www.npmjs.com/package/Shave)
[![Bower version 0.0.3](https://badge.fury.io/bo/shave.svg)](https://github.com/dollarshaveclub/shave)
[![Build Status](https://travis-ci.org/dollarshaveclub/shave.svg?branch=master)](https://travis-ci.org/dollarshaveclub/shave)
[![Share](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&maxAge=2592000)](https://twitter.com/home?status=Shave%20text%20for%20smooth%20looking%20content%20within%20a%20specified%20element%20%E2%9C%81%20https%3A%2F%2Fgithub.com%2Fdollarshaveclub%2Fshave%20%23JavaScript%20%40yowainwright%20%40DSCEngineering)
# Shave

> Shave text for smooth looking content within a specified space.

**Shave** is a javascript plugin that trims text to fit within a html element based on a set *max-height*. It is an alternative to `text-overflow: ellipsis;` in that it will truncate *multi-line* text.

## Setup

```sh
npm i shave --save-dev
# or
bower i shave --save-dev
```

## Run

1. Add **dist/shave.js**.
3. `shave` text within the element you'd like to.

## Basic Examples
```javascript
shave('#foo', maxheight); // Shave a single element
shave('.bar', maxheight); // Shave multiple elements
shave('selector:not([not this selector])', maxheight); // Complex selectors
shave('selector', maxheight, { character: '🍻' }); // Different character instead of an ellipsis
shave('selector', maxheight, { classname: 'your-css-class' }); // Adds a custom class name
$('selector').shave(maxheight, options); // Or with jQuery
$('selector').shave(maxheight, { classname: 'your-css-class' }); // Or with jQuery & options
```

## How?

**Shave.js** shaves an element's text string to the last full word that can fit within a specified max height.

## Why?

**Shave.js** is made for simplicity; it doesn't try to over solve truncation or provide tons of options. It truncates text to a specified max height.

## What about the original text?

**Shave.js** re-adds the _diff_ of the original selected element's text in a hidden `<span>`. It runs a check for that `<span>` to make sure text is shaved properly every time.

## What about size?

**Shave.js** is small - `~1.5kb` unminified and is meant to do 1 thing - _shave text to fit beautifully to a specified max height_.

## How can I use it?

You can use **Shave.js** in all modern formats and as a `jQuery` or `Zepto` plugin.

## Examples

[Codepen example](http://codepen.io/yowainwright/pen/5f471214df90f43c7996c5914c88e858/) with plain javascript.

[Codepen example](http://codepen.io/yowainwright/pen/c35ad7a281bc58ce6f89d2adb94c5d14/) with jQuery.
