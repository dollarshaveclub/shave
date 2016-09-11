export const HELPERS_ID = '\0commonjsHelpers';

export const HELPERS = `
export var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

export function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

export function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}`;

export const PREFIX = '\0commonjs-proxy:';
export const EXTERNAL = '\0commonjs-external:';
