![shave](http://imgh.us/shave.svg)

[![npm version 0.1.2](https://badge.fury.io/js/shave.svg)](https://www.npmjs.com/package/shave)
[![Bower version 0.1.2](https://badge.fury.io/bo/shave.svg)](https://github.com/dollarshaveclub/shave)
[![Build Status](https://travis-ci.org/dollarshaveclub/shave.svg?branch=master)](https://travis-ci.org/dollarshaveclub/shave)
[![Share](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&maxAge=2592000)](https://twitter.com/home?status=Shave%20is%20a%200%20dep%20js%20lib%20that%20truncates%20multiline%20text%20to%20fit%20within%20a%20html%20element%20%E2%9C%81https%3A%2F%2Fgithub.com%2Fdollarshaveclub%2Fshave%20%40DSCEngineering%20%23JavaScript%20%F0%9F%92%AA)
# Shave

**Shave** is a zero dependency javascript plugin that truncates multi-line text to fit within a html element based on a set *max-height*. It then stores the _diff_ of the original text string in a hidden `<span>` element following the visible text. This means the original text remains in tact!

**Shave, compared to other truncation plugins:**
-   maintains the original text after truncation.
-   does not require other libraries
-   only requires a selector and a max height
-   is very lightweight - `~1.5kb` unminified
-   allows for custom ellipsis strings and class names but doesn't over complicate.
-   is additive. It will play nice with other javascript libraries and more truncation features can easily be built with it.

## Installing from a package manager

npm
```sh
npm i shave --save-dev
```
bower
```
bower i shave --save-dev
```

## Usage

1. Add **dist/shave.js**.
3. `shave` text within the element you'd like to.

## Syntax

basic setup
```javascript
shave('selector', maxheight);
```
**Shave also provided options _only_ to overwrite what it uses.**

So, if you'd like have custom class names and not use `.js-shave`:
```javascript
shave('selector', maxheight, {classname: 'classname'});
```
Or, if you'd like to have custom characters (instead of the standard ellipsis):
```javascript
shave('selector', maxheight, {character: '✁'});
```
Or, both:
```javascript
shave('selector', maxheight, {classname: 'classname', character: '✁' });
```
You can also use **shave** as a _jQuery_ or _Zepto_ plugin.
```javascript
$('selector').shave(maxheight);
```
And, here's a _jQuery/Zepto_ example with custom options:
```javascript
$('selector').shave(maxheight, { classname: 'your-css-class', character: '✁'  });
```

## Examples

[Codepen example](http://codepen.io/yowainwright/pen/5f471214df90f43c7996c5914c88e858/) with plain javascript.

[Codepen example](http://codepen.io/yowainwright/pen/c35ad7a281bc58ce6f89d2adb94c5d14/) with jQuery.

## Notes

`text-overflow: ellipsis` is the way to go when truncating text to a single line. Shave does something very similar but for _multiple lines_.
