![shave](http://imgh.us/shave.svg)

[![npm version 0.0.3](https://badge.fury.io/js/Shave.svg)](https://www.npmjs.com/package/Shave)
[![Bower version 0.0.3](https://badge.fury.io/bo/shave.svg)](https://github.com/dollarshaveclub/shave)
[![Build Status](https://travis-ci.org/dollarshaveclub/shave.svg?branch=master)](https://travis-ci.org/dollarshaveclub/shave)
[![Share](https://img.shields.io/twitter/url/http/shields.io.svg?style=social&maxAge=2592000)](https://twitter.com/home?status=Shave%2C%20a%20javascript%20plugin%20for%20smooth%20looking%20content%20within%20a%20specified%20element%20%E2%9C%81%20https%3A%2F%2Fgithub.com%2Fdollarshaveclub%2Fshave%20%23JavaScript%20%40DSCEngineering)
# Shave

**Shave** is a zero dependency javascript plugin that truncates text to fit within a html element based on a set *max-height*. It then stores the _diff_ of the original text string in a hidden `<span>` element following the visible text. This means the original text remains in tact! Shave truncates *multi-line* text in the most simple, lightweight and uncomplicated way possible.

**Shave, compared to other truncation plugins:**
-   maintains the original text after truncation.
-   does not require other libraries
-   only requires a selector and a max height
-   is very lightweight - `~1.5kb` unminified
-   allows for custom ellipsis strings and class names but doesn't over complicate what's needed to truncated text within a html element.

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
