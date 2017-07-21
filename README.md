<p align="center">
  <img alt="Shave" src="http://imgh.us/shave.svg" />
</p>
<hr>
<p align="center">
  <a href="https://www.npmjs.com/package/shave">
    <img src="https://badge.fury.io/js/shave.svg" alt="npm" />
  </a>
  <a href="https://github.com/dollarshaveclub/shave">
    <img src="https://badge.fury.io/bo/shave.svg" alt="Bower" />
  </a>
  <a href="https://travis-ci.org/dollarshaveclub/shave">
    <img src="https://travis-ci.org/dollarshaveclub/shave.svg?branch=master" alt="Travis" />
  </a>
  <a href="https://greenkeeper.io/">
    <img src="https://badges.greenkeeper.io/dollarshaveclub/shave.svg" alt="Greenkeeper" />
  </a>
  <a href="https://cdnjs.com/libraries/shave">
    <img src="https://img.shields.io/cdnjs/v/shave.svg" alt="CDNJS" />
  </a>
  <a href="https://twitter.com/home?status=Shave%20is%20a%200%20dep%20js%20lib%20that%20truncates%20multiline%20text%20to%20fit%20within%20a%20html%20element%20%E2%9C%81https%3A%2F%2Fgithub.com%2Fdollarshaveclub%2Fshave%20%40DSCEngineering%20%23JavaScript%20%F0%9F%92%AA">
    <img src="https://img.shields.io/twitter/url/http/shields.io.svg?style=social&maxAge=2592000" alt="Twitter share" />
  </a>
</p>
<hr>
<h1 align="center">Shave ✁</h1>

**Shave** is a zero dependency javascript plugin that truncates multi-line text to fit within an html element based on a set **max-height**. It then stores the _diff_ of the original text string in a hidden `<span>` element following the visible text. This means the original text remains intact!

**Shave, compared to other truncation plugins:**
-   maintains the original text after truncation.
-   does not require other libraries
-   only requires a selector and a max height
-   is very lightweight; `~1.5kb` unminified
-   allows for custom ellipsis strings and class names but doesn't over complicate
-   is fast and capable of truncating text within lots of elements [quickly](http://codepen.io/pwfisher/full/ozVAyr/)
-   is additive. It will play nice with other javascript libraries and more truncation features can easily be built with it.
-   supports non-spaced languages ([Non-ascii](https://en.wikipedia.org/wiki/ASCII)).

## Installing from a package manager

npm
```sh
npm install shave --save
```
bower
```sh
bower install shave --save
```
yarn
```sh
yarn add shave
```

## Usage

Add **dist/shave.js** to your html
-  Or, **dist/jquery.shave.js** for jQuery/Zepto as of Shave >= v2.

Or as a module
```sh
import shave from 'shave';
```

## Syntax

Basic setup
```javascript
shave('selector', maxheight);
```
**Shave also provided options _only_ to overwrite what it uses.**

If you'd like have custom class names and not use `.js-shave`:
```javascript
shave('selector', maxheight, {classname: 'classname'});
```
Or if you'd like to have custom characters (instead of the standard ellipsis):
```javascript
shave('selector', maxheight, {character: '✁'});
```
Or both:
```javascript
shave('selector', maxheight, {classname: 'classname', character: '✁' });
```
You can also use **shave** as a [jQuery](http://jquery.com/) or [Zepto](http://zeptojs.com/) plugin. As of Shave >= v2, use **dist/jquery.shave.js** for jQuery/Zepto.
```javascript
$('selector').shave(maxheight);
```
And here's a _jQuery/Zepto_ example with custom options:
```javascript
$('selector').shave(maxheight, { classname: 'your-css-class', character: '✁'  });
```

If you're using a non-spaced language, you can support shave by setting an option `spaces` to `false`.
```javascript
$('selector').shave(maxheight, { classname: 'your-css-class', character: '✁', spaces: false });
```

## Examples

[Codepen example](http://codepen.io/yowainwright/pen/5f471214df90f43c7996c5914c88e858/) with plain javascript.

[Codepen example](http://codepen.io/yowainwright/pen/c35ad7a281bc58ce6f89d2adb94c5d14/) with jQuery.

[Codepen example](http://codepen.io/yowainwright/pen/wzVgMp) with a non-spaced language.

## Notes

`text-overflow: ellipsis` is the way to go when truncating text to a single line. Shave does something very similar but for _multiple lines_.

Shave implements a [binary search](http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/) to truncate text in the most optimal way possible.

Shave is meant to truncate text within a selected html element. This means it will overwrite html within an html element with just the text within the selected element.

Here are some super basic examples of shave with [window resize](http://codepen.io/yowainwright/pen/yVBxGY) and [click](http://codepen.io/yowainwright/pen/PbYdvL/) events. 🙌

Shave works in all modern browsers and was tested in some not so modern browsers (like Internet Explorer 8) - it works there too. 🍻

----

Created and maintained by [Jeff Wainwright](https://github.com/yowainwright) with [Dollar Shave Club Engineering](https://github.com/dollarshaveclub).
