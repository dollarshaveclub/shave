/*
	Rollup.js v0.34.13
	Thu Sep 01 2016 09:46:37 GMT-0400 (EDT) - commit 7fb7ee494d70cd9cab3555474b66c4b307a6dcb2


	https://github.com/rollup/rollup

	Released under the MIT License.
*/

import { basename, dirname, resolve, relative, extname } from 'path';
import * as fs from 'fs';

var absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|\/])/;
var relativePath = /^\.?\.\//;

function isAbsolute ( path ) {
	return absolutePath.test( path );
}

function isRelative ( path ) {
	return relativePath.test( path );
}

function normalize ( path ) {
	return path.replace( /\\/g, '/' );
}

function mkdirpath ( path ) {
	var dir = dirname( path );
	try {
		fs.readdirSync( dir );
	} catch ( err ) {
		mkdirpath( dir );
		fs.mkdirSync( dir );
	}
}

function isFile ( file ) {
	try {
		var stats = fs.statSync( file );
		return stats.isFile();
	} catch ( err ) {
		return false;
	}
}

function writeFile ( dest, data ) {
	return new Promise( function ( fulfil, reject ) {
		mkdirpath( dest );

		fs.writeFile( dest, data, function (err) {
			if ( err ) {
				reject( err );
			} else {
				fulfil();
			}
		});
	});
}

var readdirSync = fs.readdirSync;
var readFileSync = fs.readFileSync;

var keys = Object.keys;

function blank () {
	return Object.create( null );
}

function forOwn ( object, func ) {
	Object.keys( object ).forEach( function (key) { return func( object[ key ], key ); } );
}

function assign ( target ) {
	var sources = [], len = arguments.length - 1;
	while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

	sources.forEach( function (source) {
		for ( var key in source ) {
			if ( source.hasOwnProperty( key ) ) target[ key ] = source[ key ];
		}
	});

	return target;
}

function mapSequence ( array, fn ) {
	var results = [];
	var promise = Promise.resolve();

	function next ( member, i ) {
		return fn( member ).then( function (value) { return results[i] = value; } );
	}

	var loop = function ( i ) {
		promise = promise.then( function () { return next( array[i], i ); } );
	};

	for ( var i = 0; i < array.length; i += 1 ) loop( i );

	return promise.then( function () { return results; } );
}

function validateKeys ( object, allowedKeys ) {
	var actualKeys = keys( object );

	var i = actualKeys.length;

	while ( i-- ) {
		var key = actualKeys[i];

		if ( allowedKeys.indexOf( key ) === -1 ) {
			return new Error(
				("Unexpected key '" + key + "' found, expected one of: " + (allowedKeys.join( ', ' )))
			);
		}
	}
}

// this looks ridiculous, but it prevents sourcemap tooling from mistaking
// this for an actual sourceMappingURL
var SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';

var SOURCEMAPPING_URL$1 = SOURCEMAPPING_URL;

var charToInteger = {};
var integerToChar = {};

'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split( '' ).forEach( function ( char, i ) {
	charToInteger[ char ] = i;
	integerToChar[ i ] = char;
});

function decode$1 ( string ) {
	var result = [],
		len = string.length,
		i,
		hasContinuationBit,
		shift = 0,
		value = 0,
		integer,
		shouldNegate;

	for ( i = 0; i < len; i += 1 ) {
		integer = charToInteger[ string[i] ];

		if ( integer === undefined ) {
			throw new Error( 'Invalid character (' + string[i] + ')' );
		}

		hasContinuationBit = integer & 32;

		integer &= 31;
		value += integer << shift;

		if ( hasContinuationBit ) {
			shift += 5;
		} else {
			shouldNegate = value & 1;
			value >>= 1;

			result.push( shouldNegate ? -value : value );

			// reset
			value = shift = 0;
		}
	}

	return result;
}

function encode$1 ( value ) {
	var result, i;

	if ( typeof value === 'number' ) {
		result = encodeInteger( value );
	} else {
		result = '';
		for ( i = 0; i < value.length; i += 1 ) {
			result += encodeInteger( value[i] );
		}
	}

	return result;
}

function encodeInteger ( num ) {
	var result = '', clamped;

	if ( num < 0 ) {
		num = ( -num << 1 ) | 1;
	} else {
		num <<= 1;
	}

	do {
		clamped = num & 31;
		num >>= 5;

		if ( num > 0 ) {
			clamped |= 32;
		}

		result += integerToChar[ clamped ];
	} while ( num > 0 );

	return result;
}

function decodeSegments(encodedSegments) {
	var i = encodedSegments.length;
	var segments = new Array(i);

	while (i--) {
		segments[i] = decode$1(encodedSegments[i]);
	}return segments;
}

function decode(mappings) {
	var sourceFileIndex = 0; // second field
	var sourceCodeLine = 0; // third field
	var sourceCodeColumn = 0; // fourth field
	var nameIndex = 0; // fifth field

	var lines = mappings.split(';');
	var numLines = lines.length;
	var decoded = new Array(numLines);

	var i = undefined;
	var j = undefined;
	var line = undefined;
	var generatedCodeColumn = undefined;
	var decodedLine = undefined;
	var segments = undefined;
	var segment = undefined;
	var result = undefined;

	for (i = 0; i < numLines; i += 1) {
		line = lines[i];

		generatedCodeColumn = 0; // first field - reset each time
		decodedLine = [];

		segments = decodeSegments(line.split(','));

		for (j = 0; j < segments.length; j += 1) {
			segment = segments[j];

			if (!segment.length) {
				break;
			}

			generatedCodeColumn += segment[0];

			result = [generatedCodeColumn];
			decodedLine.push(result);

			if (segment.length === 1) {
				// only one field!
				continue;
			}

			sourceFileIndex += segment[1];
			sourceCodeLine += segment[2];
			sourceCodeColumn += segment[3];

			result.push(sourceFileIndex, sourceCodeLine, sourceCodeColumn);

			if (segment.length === 5) {
				nameIndex += segment[4];
				result.push(nameIndex);
			}
		}

		decoded[i] = decodedLine;
	}

	return decoded;
}

function encode(decoded) {
	var offsets = {
		generatedCodeColumn: 0,
		sourceFileIndex: 0, // second field
		sourceCodeLine: 0, // third field
		sourceCodeColumn: 0, // fourth field
		nameIndex: 0 // fifth field
	};

	return decoded.map(function (line) {
		offsets.generatedCodeColumn = 0; // first field - reset each time
		return line.map(encodeSegment).join(',');
	}).join(';');

	function encodeSegment(segment) {
		if (!segment.length) {
			return segment;
		}

		var result = new Array(segment.length);

		result[0] = segment[0] - offsets.generatedCodeColumn;
		offsets.generatedCodeColumn = segment[0];

		if (segment.length === 1) {
			// only one field!
			return encode$1(result);
		}

		result[1] = segment[1] - offsets.sourceFileIndex;
		result[2] = segment[2] - offsets.sourceCodeLine;
		result[3] = segment[3] - offsets.sourceCodeColumn;

		offsets.sourceFileIndex = segment[1];
		offsets.sourceCodeLine = segment[2];
		offsets.sourceCodeColumn = segment[3];

		if (segment.length === 5) {
			result[4] = segment[4] - offsets.nameIndex;
			offsets.nameIndex = segment[4];
		}

		return encode$1(result);
	}
}

var charToInteger$1 = {};
var integerToChar$1 = {};

'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split( '' ).forEach( function ( char, i ) {
	charToInteger$1[ char ] = i;
	integerToChar$1[ i ] = char;
});

function encode$1$1 ( value ) {
	var result, i;

	if ( typeof value === 'number' ) {
		result = encodeInteger$1( value );
	} else {
		result = '';
		for ( i = 0; i < value.length; i += 1 ) {
			result += encodeInteger$1( value[i] );
		}
	}

	return result;
}

function encodeInteger$1 ( num ) {
	var result = '', clamped;

	if ( num < 0 ) {
		num = ( -num << 1 ) | 1;
	} else {
		num <<= 1;
	}

	do {
		clamped = num & 31;
		num >>= 5;

		if ( num > 0 ) {
			clamped |= 32;
		}

		result += integerToChar$1[ clamped ];
	} while ( num > 0 );

	return result;
}

function Chunk ( start, end, content ) {
	this.start = start;
	this.end = end;
	this.original = content;

	this.intro = '';
	this.outro = '';

	this.content = content;
	this.storeName = false;
	this.edited = false;

	// we make these non-enumerable, for sanity while debugging
	Object.defineProperties( this, {
		previous: { writable: true, value: null },
		next: { writable: true, value: null }
	});
}

Chunk.prototype = {
	append: function append ( content ) {
		this.outro += content;
	},

	clone: function clone () {
		var chunk = new Chunk( this.start, this.end, this.original );

		chunk.intro = this.intro;
		chunk.outro = this.outro;
		chunk.content = this.content;
		chunk.storeName = this.storeName;
		chunk.edited = this.edited;

		return chunk;
	},

	contains: function contains ( index ) {
		return this.start < index && index < this.end;
	},

	eachNext: function eachNext ( fn ) {
		var chunk = this;
		while ( chunk ) {
			fn( chunk );
			chunk = chunk.next;
		}
	},

	eachPrevious: function eachPrevious ( fn ) {
		var chunk = this;
		while ( chunk ) {
			fn( chunk );
			chunk = chunk.previous;
		}
	},

	edit: function edit ( content, storeName ) {
		this.content = content;
		this.storeName = storeName;

		this.edited = true;

		return this;
	},

	prepend: function prepend ( content ) {
		this.intro = content + this.intro;
	},

	split: function split ( index ) {
		var sliceIndex = index - this.start;

		var originalBefore = this.original.slice( 0, sliceIndex );
		var originalAfter = this.original.slice( sliceIndex );

		this.original = originalBefore;

		var newChunk = new Chunk( index, this.end, originalAfter );
		newChunk.outro = this.outro;
		this.outro = '';

		this.end = index;

		if ( this.edited ) {
			// TODO is this block necessary?...
			newChunk.edit( '', false );
			this.content = '';
		} else {
			this.content = originalBefore;
		}

		newChunk.next = this.next;
		if ( newChunk.next ) newChunk.next.previous = newChunk;
		newChunk.previous = this;
		this.next = newChunk;

		return newChunk;
	},

	toString: function toString () {
		return this.intro + this.content + this.outro;
	},

	trimEnd: function trimEnd ( rx ) {
		this.outro = this.outro.replace( rx, '' );
		if ( this.outro.length ) return true;

		var trimmed = this.content.replace( rx, '' );

		if ( trimmed.length ) {
			if ( trimmed !== this.content ) {
				this.split( this.start + trimmed.length ).edit( '', false );
			}

			return true;
		} else {
			this.edit( '', false );

			this.intro = this.intro.replace( rx, '' );
			if ( this.intro.length ) return true;
		}
	},

	trimStart: function trimStart ( rx ) {
		this.intro = this.intro.replace( rx, '' );
		if ( this.intro.length ) return true;

		var trimmed = this.content.replace( rx, '' );

		if ( trimmed.length ) {
			if ( trimmed !== this.content ) {
				this.split( this.end - trimmed.length );
				this.edit( '', false );
			}

			return true;
		} else {
			this.edit( '', false );

			this.outro = this.outro.replace( rx, '' );
			if ( this.outro.length ) return true;
		}
	}
};

var _btoa;

if ( typeof window !== 'undefined' && typeof window.btoa === 'function' ) {
	_btoa = window.btoa;
} else if ( typeof Buffer === 'function' ) {
	_btoa = function (str) { return new Buffer( str ).toString( 'base64' ); };
} else {
	_btoa = function () {
		throw new Error( 'Unsupported environment: `window.btoa` or `Buffer` should be supported.' );
	};
}

var btoa = _btoa;

function SourceMap ( properties ) {
	this.version = 3;

	this.file           = properties.file;
	this.sources        = properties.sources;
	this.sourcesContent = properties.sourcesContent;
	this.names          = properties.names;
	this.mappings       = properties.mappings;
}

SourceMap.prototype = {
	toString: function toString () {
		return JSON.stringify( this );
	},

	toUrl: function toUrl () {
		return 'data:application/json;charset=utf-8;base64,' + btoa( this.toString() );
	}
};

function guessIndent ( code ) {
	var lines = code.split( '\n' );

	var tabbed = lines.filter( function (line) { return /^\t+/.test( line ); } );
	var spaced = lines.filter( function (line) { return /^ {2,}/.test( line ); } );

	if ( tabbed.length === 0 && spaced.length === 0 ) {
		return null;
	}

	// More lines tabbed than spaced? Assume tabs, and
	// default to tabs in the case of a tie (or nothing
	// to go on)
	if ( tabbed.length >= spaced.length ) {
		return '\t';
	}

	// Otherwise, we need to guess the multiple
	var min = spaced.reduce( function ( previous, current ) {
		var numSpaces = /^ +/.exec( current )[0].length;
		return Math.min( numSpaces, previous );
	}, Infinity );

	return new Array( min + 1 ).join( ' ' );
}

function getLocator ( source ) {
	var originalLines = source.split( '\n' );

	var start = 0;
	var lineRanges = originalLines.map( function ( line, i ) {
		var end = start + line.length + 1;
		var range = { start: start, end: end, line: i };

		start = end;
		return range;
	});

	var i = 0;

	function rangeContains ( range, index ) {
		return range.start <= index && index < range.end;
	}

	function getLocation ( range, index ) {
		return { line: range.line, column: index - range.start };
	}

	return function locate ( index ) {
		var range = lineRanges[i];

		var d = index >= range.end ? 1 : -1;

		while ( range ) {
			if ( rangeContains( range, index ) ) return getLocation( range, index );

			i += d;
			range = lineRanges[i];
		}
	};
}

var nonWhitespace = /\S/;

function encodeMappings ( original, intro, outro, chunk, hires, sourcemapLocations, sourceIndex, offsets, names ) {
	var rawLines = [];

	var generatedCodeLine = intro.split( '\n' ).length - 1;
	var rawSegments = rawLines[ generatedCodeLine ] = [];

	var generatedCodeColumn = 0;

	var locate = getLocator( original );

	function addEdit ( content, original, loc, nameIndex, i ) {
		if ( i || ( content.length && nonWhitespace.test( content ) ) ) {
			rawSegments.push({
				generatedCodeLine: generatedCodeLine,
				generatedCodeColumn: generatedCodeColumn,
				sourceCodeLine: loc.line,
				sourceCodeColumn: loc.column,
				sourceCodeName: nameIndex,
				sourceIndex: sourceIndex
			});
		}

		var lines = content.split( '\n' );
		var lastLine = lines.pop();

		if ( lines.length ) {
			generatedCodeLine += lines.length;
			rawLines[ generatedCodeLine ] = rawSegments = [];
			generatedCodeColumn = lastLine.length;
		} else {
			generatedCodeColumn += lastLine.length;
		}

		lines = original.split( '\n' );
		lastLine = lines.pop();

		if ( lines.length ) {
			loc.line += lines.length;
			loc.column = lastLine.length;
		} else {
			loc.column += lastLine.length;
		}
	}

	function addUneditedChunk ( chunk, loc ) {
		var originalCharIndex = chunk.start;
		var first = true;

		while ( originalCharIndex < chunk.end ) {
			if ( hires || first || sourcemapLocations[ originalCharIndex ] ) {
				rawSegments.push({
					generatedCodeLine: generatedCodeLine,
					generatedCodeColumn: generatedCodeColumn,
					sourceCodeLine: loc.line,
					sourceCodeColumn: loc.column,
					sourceCodeName: -1,
					sourceIndex: sourceIndex
				});
			}

			if ( original[ originalCharIndex ] === '\n' ) {
				loc.line += 1;
				loc.column = 0;
				generatedCodeLine += 1;
				rawLines[ generatedCodeLine ] = rawSegments = [];
				generatedCodeColumn = 0;
			} else {
				loc.column += 1;
				generatedCodeColumn += 1;
			}

			originalCharIndex += 1;
			first = false;
		}
	}

	var hasContent = false;

	while ( chunk ) {
		var loc = locate( chunk.start );

		if ( chunk.intro.length ) {
			addEdit( chunk.intro, '', loc, -1, hasContent );
		}

		if ( chunk.edited ) {
			addEdit( chunk.content, chunk.original, loc, chunk.storeName ? names.indexOf( chunk.original ) : -1, hasContent );
		} else {
			addUneditedChunk( chunk, loc );
		}

		if ( chunk.outro.length ) {
			addEdit( chunk.outro, '', loc, -1, hasContent );
		}

		if ( chunk.content || chunk.intro || chunk.outro ) hasContent = true;

		var nextChunk = chunk.next;
		chunk = nextChunk;
	}

	offsets.sourceIndex = offsets.sourceIndex || 0;
	offsets.sourceCodeLine = offsets.sourceCodeLine || 0;
	offsets.sourceCodeColumn = offsets.sourceCodeColumn || 0;
	offsets.sourceCodeName = offsets.sourceCodeName || 0;

	var outroSemis = outro.split( '\n' ).map( function () { return ''; } ).join( ';' );

	var encoded = rawLines.map( function (segments) {
		var generatedCodeColumn = 0;

		return segments.map( function (segment) {
			var arr = [
				segment.generatedCodeColumn - generatedCodeColumn,
				segment.sourceIndex - offsets.sourceIndex,
				segment.sourceCodeLine - offsets.sourceCodeLine,
				segment.sourceCodeColumn - offsets.sourceCodeColumn
			];

			generatedCodeColumn = segment.generatedCodeColumn;
			offsets.sourceIndex = segment.sourceIndex;
			offsets.sourceCodeLine = segment.sourceCodeLine;
			offsets.sourceCodeColumn = segment.sourceCodeColumn;

			if ( ~segment.sourceCodeName ) {
				arr.push( segment.sourceCodeName - offsets.sourceCodeName );
				offsets.sourceCodeName = segment.sourceCodeName;
			}

			return encode$1$1( arr );
		}).join( ',' );
	}).join( ';' ) + outroSemis;

	return encoded;
}

function getRelativePath ( from, to ) {
	var fromParts = from.split( /[\/\\]/ );
	var toParts = to.split( /[\/\\]/ );

	fromParts.pop(); // get dirname

	while ( fromParts[0] === toParts[0] ) {
		fromParts.shift();
		toParts.shift();
	}

	if ( fromParts.length ) {
		var i = fromParts.length;
		while ( i-- ) fromParts[i] = '..';
	}

	return fromParts.concat( toParts ).join( '/' );
}

var toString = Object.prototype.toString;

function isObject ( thing ) {
	return toString.call( thing ) === '[object Object]';
}

function MagicString ( string, options ) {
	if ( options === void 0 ) options = {};

	var chunk = new Chunk( 0, string.length, string );

	Object.defineProperties( this, {
		original:              { writable: true, value: string },
		outro:                 { writable: true, value: '' },
		intro:                 { writable: true, value: '' },
		firstChunk:            { writable: true, value: chunk },
		lastChunk:             { writable: true, value: chunk },
		lastSearchedChunk:     { writable: true, value: chunk },
		byStart:               { writable: true, value: {} },
		byEnd:                 { writable: true, value: {} },
		filename:              { writable: true, value: options.filename },
		indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
		sourcemapLocations:    { writable: true, value: {} },
		storedNames:           { writable: true, value: {} },
		indentStr:             { writable: true, value: guessIndent( string ) }
	});

	if ( false ) {}

	this.byStart[ 0 ] = chunk;
	this.byEnd[ string.length ] = chunk;
}

MagicString.prototype = {
	addSourcemapLocation: function addSourcemapLocation ( char ) {
		this.sourcemapLocations[ char ] = true;
	},

	append: function append ( content ) {
		if ( typeof content !== 'string' ) throw new TypeError( 'outro content must be a string' );

		this.outro += content;
		return this;
	},

	clone: function clone () {
		var cloned = new MagicString( this.original, { filename: this.filename });

		var originalChunk = this.firstChunk;
		var clonedChunk = cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone();

		while ( originalChunk ) {
			cloned.byStart[ clonedChunk.start ] = clonedChunk;
			cloned.byEnd[ clonedChunk.end ] = clonedChunk;

			var nextOriginalChunk = originalChunk.next;
			var nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();

			if ( nextClonedChunk ) {
				clonedChunk.next = nextClonedChunk;
				nextClonedChunk.previous = clonedChunk;

				clonedChunk = nextClonedChunk;
			}

			originalChunk = nextOriginalChunk;
		}

		cloned.lastChunk = clonedChunk;

		if ( this.indentExclusionRanges ) {
			cloned.indentExclusionRanges = typeof this.indentExclusionRanges[0] === 'number' ?
				[ this.indentExclusionRanges[0], this.indentExclusionRanges[1] ] :
				this.indentExclusionRanges.map( function (range) { return [ range.start, range.end ]; } );
		}

		Object.keys( this.sourcemapLocations ).forEach( function (loc) {
			cloned.sourcemapLocations[ loc ] = true;
		});

		return cloned;
	},

	generateMap: function generateMap ( options ) {
		options = options || {};

		var names = Object.keys( this.storedNames );

		if ( false ) {}
		var map = new SourceMap({
			file: ( options.file ? options.file.split( /[\/\\]/ ).pop() : null ),
			sources: [ options.source ? getRelativePath( options.file || '', options.source ) : null ],
			sourcesContent: options.includeContent ? [ this.original ] : [ null ],
			names: names,
			mappings: this.getMappings( options.hires, 0, {}, names )
		});
		if ( false ) {}

		return map;
	},

	getIndentString: function getIndentString () {
		return this.indentStr === null ? '\t' : this.indentStr;
	},

	getMappings: function getMappings ( hires, sourceIndex, offsets, names ) {
		return encodeMappings( this.original, this.intro, this.outro, this.firstChunk, hires, this.sourcemapLocations, sourceIndex, offsets, names );
	},

	indent: function indent ( indentStr, options ) {
		var this$1 = this;

		var pattern = /^[^\r\n]/gm;

		if ( isObject( indentStr ) ) {
			options = indentStr;
			indentStr = undefined;
		}

		indentStr = indentStr !== undefined ? indentStr : ( this.indentStr || '\t' );

		if ( indentStr === '' ) return this; // noop

		options = options || {};

		// Process exclusion ranges
		var isExcluded = {};

		if ( options.exclude ) {
			var exclusions = typeof options.exclude[0] === 'number' ? [ options.exclude ] : options.exclude;
			exclusions.forEach( function (exclusion) {
				for ( var i = exclusion[0]; i < exclusion[1]; i += 1 ) {
					isExcluded[i] = true;
				}
			});
		}

		var shouldIndentNextCharacter = options.indentStart !== false;
		var replacer = function (match) {
			if ( shouldIndentNextCharacter ) return ("" + indentStr + match);
			shouldIndentNextCharacter = true;
			return match;
		};

		this.intro = this.intro.replace( pattern, replacer );

		var charIndex = 0;

		var chunk = this.firstChunk;

		while ( chunk ) {
			var end = chunk.end;

			if ( chunk.edited ) {
				if ( !isExcluded[ charIndex ] ) {
					chunk.content = chunk.content.replace( pattern, replacer );

					if ( chunk.content.length ) {
						shouldIndentNextCharacter = chunk.content[ chunk.content.length - 1 ] === '\n';
					}
				}
			} else {
				charIndex = chunk.start;

				while ( charIndex < end ) {
					if ( !isExcluded[ charIndex ] ) {
						var char = this$1.original[ charIndex ];

						if ( char === '\n' ) {
							shouldIndentNextCharacter = true;
						} else if ( char !== '\r' && shouldIndentNextCharacter ) {
							shouldIndentNextCharacter = false;

							if ( charIndex === chunk.start ) {
								chunk.prepend( indentStr );
							} else {
								var rhs = chunk.split( charIndex );
								rhs.prepend( indentStr );

								this$1.byStart[ charIndex ] = rhs;
								this$1.byEnd[ charIndex ] = chunk;

								chunk = rhs;
							}
						}
					}

					charIndex += 1;
				}
			}

			charIndex = chunk.end;
			chunk = chunk.next;
		}

		this.outro = this.outro.replace( pattern, replacer );

		return this;
	},

	insert: function insert () {
		throw new Error( 'magicString.insert(...) is deprecated. Use insertRight(...) or insertLeft(...)' );
	},

	insertLeft: function insertLeft ( index, content ) {
		if ( typeof content !== 'string' ) throw new TypeError( 'inserted content must be a string' );

		if ( false ) {}

		this._split( index );

		var chunk = this.byEnd[ index ];

		if ( chunk ) {
			chunk.append( content );
		} else {
			this.intro += content;
		}

		if ( false ) {}
		return this;
	},

	insertRight: function insertRight ( index, content ) {
		if ( typeof content !== 'string' ) throw new TypeError( 'inserted content must be a string' );

		if ( false ) {}

		this._split( index );

		var chunk = this.byStart[ index ];

		if ( chunk ) {
			chunk.prepend( content );
		} else {
			this.outro += content;
		}

		if ( false ) {}
		return this;
	},

	move: function move ( start, end, index ) {
		if ( index >= start && index <= end ) throw new Error( 'Cannot move a selection inside itself' );

		if ( false ) {}

		this._split( start );
		this._split( end );
		this._split( index );

		var first = this.byStart[ start ];
		var last = this.byEnd[ end ];

		var oldLeft = first.previous;
		var oldRight = last.next;

		var newRight = this.byStart[ index ];
		if ( !newRight && last === this.lastChunk ) return this;
		var newLeft = newRight ? newRight.previous : this.lastChunk;

		if ( oldLeft ) oldLeft.next = oldRight;
		if ( oldRight ) oldRight.previous = oldLeft;

		if ( newLeft ) newLeft.next = first;
		if ( newRight ) newRight.previous = last;

		if ( !first.previous ) this.firstChunk = last.next;
		if ( !last.next ) {
			this.lastChunk = first.previous;
			this.lastChunk.next = null;
		}

		first.previous = newLeft;
		last.next = newRight;

		if ( !newLeft ) this.firstChunk = first;
		if ( !newRight ) this.lastChunk = last;

		if ( false ) {}
		return this;
	},

	overwrite: function overwrite ( start, end, content, storeName ) {
		var this$1 = this;

		if ( typeof content !== 'string' ) throw new TypeError( 'replacement content must be a string' );

		while ( start < 0 ) start += this$1.original.length;
		while ( end < 0 ) end += this$1.original.length;

		if ( end > this.original.length ) throw new Error( 'end is out of bounds' );
		if ( start === end ) throw new Error( 'Cannot overwrite a zero-length range – use insertLeft or insertRight instead' );

		if ( false ) {}

		this._split( start );
		this._split( end );

		if ( storeName ) {
			var original = this.original.slice( start, end );
			this.storedNames[ original ] = true;
		}

		var first = this.byStart[ start ];
		var last = this.byEnd[ end ];

		if ( first ) {
			first.edit( content, storeName );

			if ( first !== last ) {
				first.outro = '';

				var chunk = first.next;
				while ( chunk !== last ) {
					chunk.edit( '', false );
					chunk.intro = chunk.outro = '';
					chunk = chunk.next;
				}

				chunk.edit( '', false );
				chunk.intro = '';
			}
		}

		else {
			// must be inserting at the end
			var newChunk = new Chunk( start, end, '' ).edit( content, storeName );

			// TODO last chunk in the array may not be the last chunk, if it's moved...
			last.next = newChunk;
			newChunk.previous = last;
		}

		if ( false ) {}
		return this;
	},

	prepend: function prepend ( content ) {
		if ( typeof content !== 'string' ) throw new TypeError( 'outro content must be a string' );

		this.intro = content + this.intro;
		return this;
	},

	remove: function remove ( start, end ) {
		var this$1 = this;

		while ( start < 0 ) start += this$1.original.length;
		while ( end < 0 ) end += this$1.original.length;

		if ( start === end ) return this;

		if ( start < 0 || end > this.original.length ) throw new Error( 'Character is out of bounds' );
		if ( start > end ) throw new Error( 'end must be greater than start' );

		return this.overwrite( start, end, '', false );
	},

	slice: function slice ( start, end ) {
		var this$1 = this;
		if ( start === void 0 ) start = 0;
		if ( end === void 0 ) end = this.original.length;

		while ( start < 0 ) start += this$1.original.length;
		while ( end < 0 ) end += this$1.original.length;

		var result = '';

		// find start chunk
		var chunk = this.firstChunk;
		while ( chunk && ( chunk.start > start || chunk.end <= start ) ) {

			// found end chunk before start
			if ( chunk.start < end && chunk.end >= end ) {
				return result;
			}

			chunk = chunk.next;
		}

		if ( chunk && chunk.edited && chunk.start !== start ) throw new Error(("Cannot use replaced character " + start + " as slice start anchor."));

		var startChunk = chunk;
		while ( chunk ) {
			if ( chunk.intro && ( startChunk !== chunk || chunk.start === start ) ) {
				result += chunk.intro;
			}

			var containsEnd = chunk.start < end && chunk.end >= end;
			if ( containsEnd && chunk.edited && chunk.end !== end ) throw new Error(("Cannot use replaced character " + end + " as slice end anchor."));

			var sliceStart = startChunk === chunk ? start - chunk.start : 0;
			var sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;

			result += chunk.content.slice( sliceStart, sliceEnd );

			if ( chunk.outro && ( !containsEnd || chunk.end === end ) ) {
				result += chunk.outro;
			}

			if ( containsEnd ) {
				break;
			}

			chunk = chunk.next;
		}

		return result;
	},

	// TODO deprecate this? not really very useful
	snip: function snip ( start, end ) {
		var clone = this.clone();
		clone.remove( 0, start );
		clone.remove( end, clone.original.length );

		return clone;
	},

	_split: function _split ( index ) {
		var this$1 = this;

		if ( this.byStart[ index ] || this.byEnd[ index ] ) return;

		if ( false ) {}

		var chunk = this.lastSearchedChunk;
		var searchForward = index > chunk.end;

		while ( true ) {
			if ( chunk.contains( index ) ) return this$1._splitChunk( chunk, index );

			chunk = searchForward ?
				this$1.byStart[ chunk.end ] :
				this$1.byEnd[ chunk.start ];
		}
	},

	_splitChunk: function _splitChunk ( chunk, index ) {
		if ( chunk.edited && chunk.content.length ) { // zero-length edited chunks are a special case (overlapping replacements)
			var loc = getLocator( this.original )( index );
			throw new Error( ("Cannot split a chunk that has already been edited (" + (loc.line) + ":" + (loc.column) + " – \"" + (chunk.original) + "\")") );
		}

		var newChunk = chunk.split( index );

		this.byEnd[ index ] = chunk;
		this.byStart[ index ] = newChunk;
		this.byEnd[ newChunk.end ] = newChunk;

		if ( chunk === this.lastChunk ) this.lastChunk = newChunk;

		this.lastSearchedChunk = chunk;
		if ( false ) {}
		return true;
	},

	toString: function toString () {
		var str = this.intro;

		var chunk = this.firstChunk;
		while ( chunk ) {
			str += chunk.toString();
			chunk = chunk.next;
		}

		return str + this.outro;
	},

	trimLines: function trimLines () {
		return this.trim('[\\r\\n]');
	},

	trim: function trim ( charType ) {
		return this.trimStart( charType ).trimEnd( charType );
	},

	trimEnd: function trimEnd ( charType ) {
		var this$1 = this;

		var rx = new RegExp( ( charType || '\\s' ) + '+$' );

		this.outro = this.outro.replace( rx, '' );
		if ( this.outro.length ) return this;

		var chunk = this.lastChunk;

		do {
			var end = chunk.end;
			var aborted = chunk.trimEnd( rx );

			// if chunk was trimmed, we have a new lastChunk
			if ( chunk.end !== end ) {
				this$1.lastChunk = chunk.next;

				this$1.byEnd[ chunk.end ] = chunk;
				this$1.byStart[ chunk.next.start ] = chunk.next;
			}

			if ( aborted ) return this$1;
			chunk = chunk.previous;
		} while ( chunk );

		return this;
	},

	trimStart: function trimStart ( charType ) {
		var this$1 = this;

		var rx = new RegExp( '^' + ( charType || '\\s' ) + '+' );

		this.intro = this.intro.replace( rx, '' );
		if ( this.intro.length ) return this;

		var chunk = this.firstChunk;

		do {
			var end = chunk.end;
			var aborted = chunk.trimStart( rx );

			if ( chunk.end !== end ) {
				// special case...
				if ( chunk === this$1.lastChunk ) this$1.lastChunk = chunk.next;

				this$1.byEnd[ chunk.end ] = chunk;
				this$1.byStart[ chunk.next.start ] = chunk.next;
			}

			if ( aborted ) return this$1;
			chunk = chunk.next;
		} while ( chunk );

		return this;
	}
};

var hasOwnProp = Object.prototype.hasOwnProperty;

function Bundle$1 ( options ) {
	if ( options === void 0 ) options = {};

	this.intro = options.intro || '';
	this.separator = options.separator !== undefined ? options.separator : '\n';

	this.sources = [];

	this.uniqueSources = [];
	this.uniqueSourceIndexByFilename = {};
}

Bundle$1.prototype = {
	addSource: function addSource ( source ) {
		if ( source instanceof MagicString ) {
			return this.addSource({
				content: source,
				filename: source.filename,
				separator: this.separator
			});
		}

		if ( !isObject( source ) || !source.content ) {
			throw new Error( 'bundle.addSource() takes an object with a `content` property, which should be an instance of MagicString, and an optional `filename`' );
		}

		[ 'filename', 'indentExclusionRanges', 'separator' ].forEach( function (option) {
			if ( !hasOwnProp.call( source, option ) ) source[ option ] = source.content[ option ];
		});

		if ( source.separator === undefined ) { // TODO there's a bunch of this sort of thing, needs cleaning up
			source.separator = this.separator;
		}

		if ( source.filename ) {
			if ( !hasOwnProp.call( this.uniqueSourceIndexByFilename, source.filename ) ) {
				this.uniqueSourceIndexByFilename[ source.filename ] = this.uniqueSources.length;
				this.uniqueSources.push({ filename: source.filename, content: source.content.original });
			} else {
				var uniqueSource = this.uniqueSources[ this.uniqueSourceIndexByFilename[ source.filename ] ];
				if ( source.content.original !== uniqueSource.content ) {
					throw new Error( ("Illegal source: same filename (" + (source.filename) + "), different contents") );
				}
			}
		}

		this.sources.push( source );
		return this;
	},

	append: function append ( str, options ) {
		this.addSource({
			content: new MagicString( str ),
			separator: ( options && options.separator ) || ''
		});

		return this;
	},

	clone: function clone () {
		var bundle = new Bundle$1({
			intro: this.intro,
			separator: this.separator
		});

		this.sources.forEach( function (source) {
			bundle.addSource({
				filename: source.filename,
				content: source.content.clone(),
				separator: source.separator
			});
		});

		return bundle;
	},

	generateMap: function generateMap ( options ) {
		var this$1 = this;

		var offsets = {};

		var names = [];
		this.sources.forEach( function (source) {
			Object.keys( source.content.storedNames ).forEach( function (name) {
				if ( !~names.indexOf( name ) ) names.push( name );
			});
		});

		var encoded = (
			getSemis( this.intro ) +
			this.sources.map( function ( source, i ) {
				var prefix = ( i > 0 ) ? ( getSemis( source.separator ) || ',' ) : '';
				var mappings;

				// we don't bother encoding sources without a filename
				if ( !source.filename ) {
					mappings = getSemis( source.content.toString() );
				} else {
					var sourceIndex = this$1.uniqueSourceIndexByFilename[ source.filename ];
					mappings = source.content.getMappings( options.hires, sourceIndex, offsets, names );
				}

				return prefix + mappings;
			}).join( '' )
		);

		return new SourceMap({
			file: ( options.file ? options.file.split( /[\/\\]/ ).pop() : null ),
			sources: this.uniqueSources.map( function (source) {
				return options.file ? getRelativePath( options.file, source.filename ) : source.filename;
			}),
			sourcesContent: this.uniqueSources.map( function (source) {
				return options.includeContent ? source.content : null;
			}),
			names: names,
			mappings: encoded
		});
	},

	getIndentString: function getIndentString () {
		var indentStringCounts = {};

		this.sources.forEach( function (source) {
			var indentStr = source.content.indentStr;

			if ( indentStr === null ) return;

			if ( !indentStringCounts[ indentStr ] ) indentStringCounts[ indentStr ] = 0;
			indentStringCounts[ indentStr ] += 1;
		});

		return ( Object.keys( indentStringCounts ).sort( function ( a, b ) {
			return indentStringCounts[a] - indentStringCounts[b];
		})[0] ) || '\t';
	},

	indent: function indent ( indentStr ) {
		var this$1 = this;

		if ( !arguments.length ) {
			indentStr = this.getIndentString();
		}

		if ( indentStr === '' ) return this; // noop

		var trailingNewline = !this.intro || this.intro.slice( -1 ) === '\n';

		this.sources.forEach( function ( source, i ) {
			var separator = source.separator !== undefined ? source.separator : this$1.separator;
			var indentStart = trailingNewline || ( i > 0 && /\r?\n$/.test( separator ) );

			source.content.indent( indentStr, {
				exclude: source.indentExclusionRanges,
				indentStart: indentStart//: trailingNewline || /\r?\n$/.test( separator )  //true///\r?\n/.test( separator )
			});

			// TODO this is a very slow way to determine this
			trailingNewline = source.content.toString().slice( 0, -1 ) === '\n';
		});

		if ( this.intro ) {
			this.intro = indentStr + this.intro.replace( /^[^\n]/gm, function ( match, index ) {
				return index > 0 ? indentStr + match : match;
			});
		}

		return this;
	},

	prepend: function prepend ( str ) {
		this.intro = str + this.intro;
		return this;
	},

	toString: function toString () {
		var this$1 = this;

		var body = this.sources.map( function ( source, i ) {
			var separator = source.separator !== undefined ? source.separator : this$1.separator;
			var str = ( i > 0 ? separator : '' ) + source.content.toString();

			return str;
		}).join( '' );

		return this.intro + body;
	},

	trimLines: function trimLines () {
		return this.trim('[\\r\\n]');
	},

	trim: function trim ( charType ) {
		return this.trimStart( charType ).trimEnd( charType );
	},

	trimStart: function trimStart ( charType ) {
		var this$1 = this;

		var rx = new RegExp( '^' + ( charType || '\\s' ) + '+' );
		this.intro = this.intro.replace( rx, '' );

		if ( !this.intro ) {
			var source;
			var i = 0;

			do {
				source = this$1.sources[i];

				if ( !source ) {
					break;
				}

				source.content.trimStart( charType );
				i += 1;
			} while ( source.content.toString() === '' ); // TODO faster way to determine non-empty source?
		}

		return this;
	},

	trimEnd: function trimEnd ( charType ) {
		var this$1 = this;

		var rx = new RegExp( ( charType || '\\s' ) + '+$' );

		var source;
		var i = this.sources.length - 1;

		do {
			source = this$1.sources[i];

			if ( !source ) {
				this$1.intro = this$1.intro.replace( rx, '' );
				break;
			}

			source.content.trimEnd( charType );
			i -= 1;
		} while ( source.content.toString() === '' ); // TODO faster way to determine non-empty source?

		return this;
	}
};

function getSemis ( str ) {
	return new Array( str.split( '\n' ).length ).join( ';' );
}

// Return the first non-falsy result from an array of
// maybe-sync, maybe-promise-returning functions
function first ( candidates ) {
	return function () {
		var args = [], len = arguments.length;
		while ( len-- ) args[ len ] = arguments[ len ];

		return candidates.reduce( function ( promise, candidate ) {
			return promise.then( function (result) { return result != null ?
				result :
				Promise.resolve( candidate.apply( void 0, args ) ); } );
		}, Promise.resolve() );
	};
}

function find ( array, fn ) {
	for ( var i = 0; i < array.length; i += 1 ) {
		if ( fn( array[i], i ) ) return array[i];
	}

	return null;
}

// Reserved word lists for various dialects of the language

var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  7: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
}

// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this"

var keywords = {
  5: ecma5AndLessKeywords,
  6: ecma5AndLessKeywords + " const class extends export import super"
}

// ## Character categories

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `bin/generate-identifier-regex.js`.

var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fd5\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ae\ua7b0-\ua7b7\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc"
var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d4-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d01-\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf8\u1cf9\u1dc0-\u1df5\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f"

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]")
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]")

nonASCIIidentifierStartChars = nonASCIIidentifierChars = null

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by bin/generate-identifier-regex.js
var astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,17,26,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,26,45,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,785,52,76,44,33,24,27,35,42,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,54,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,86,25,391,63,32,0,449,56,264,8,2,36,18,0,50,29,881,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,881,68,12,0,67,12,65,0,32,6124,20,754,9486,1,3071,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,60,67,1213,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,3,5761,10591,541]
var astralIdentifierCodes = [509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,1306,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,52,0,13,2,49,13,10,2,4,9,83,11,7,0,161,11,6,9,7,3,57,0,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,87,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,423,9,838,7,2,7,17,9,57,21,2,13,19882,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,2214,6,110,6,6,9,792487,239]

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i]
    if (pos > code) return false
    pos += set[i + 1]
    if (pos >= code) return true
  }
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) return code === 36
  if (code < 91) return true
  if (code < 97) return code === 95
  if (code < 123) return true
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code))
  if (astral === false) return false
  return isInAstralSet(code, astralIdentifierStartCodes)
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) return code === 36
  if (code < 58) return true
  if (code < 65) return false
  if (code < 91) return true
  if (code < 97) return code === 95
  if (code < 123) return true
  if (code <= 0xffff) return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code))
  if (astral === false) return false
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
}

// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

var TokenType = function TokenType(label, conf) {
  if ( conf === void 0 ) conf = {};

  this.label = label
  this.keyword = conf.keyword
  this.beforeExpr = !!conf.beforeExpr
  this.startsExpr = !!conf.startsExpr
  this.isLoop = !!conf.isLoop
  this.isAssign = !!conf.isAssign
  this.prefix = !!conf.prefix
  this.postfix = !!conf.postfix
  this.binop = conf.binop || null
  this.updateContext = null
};

function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}
var beforeExpr = {beforeExpr: true};
var startsExpr = {startsExpr: true};
// Map keyword names to token types.

var keywordTypes = {}

// Succinct definitions of keyword token types
function kw(name, options) {
  if ( options === void 0 ) options = {};

  options.keyword = name
  return keywordTypes[name] = new TokenType(name, options)
}

var tt = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  prefix: new TokenType("prefix", {beforeExpr: true, prefix: true, startsExpr: true}),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=", 6),
  relational: binop("</>", 7),
  bitShift: binop("<</>>", 8),
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {beforeExpr: true}),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class"),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import"),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
}

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/
var lineBreakG = new RegExp(lineBreak.source, "g")

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code == 0x2029
}

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/

var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g

function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]"
}

// Checks if an object has a property.

function has(obj, propName) {
  return Object.prototype.hasOwnProperty.call(obj, propName)
}

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = function Position(line, col) {
  this.line = line
  this.column = col
};

Position.prototype.offset = function offset (n) {
  return new Position(this.line, this.column + n)
};

var SourceLocation = function SourceLocation(p, start, end) {
  this.start = start
  this.end = end
  if (p.sourceFile !== null) this.source = p.sourceFile
};

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    lineBreakG.lastIndex = cur
    var match = lineBreakG.exec(input)
    if (match && match.index < offset) {
      ++line
      cur = match.index + match[0].length
    } else {
      return new Position(line, offset - cur)
    }
  }
}

// A second optional argument can be given to further configure
// the parser process. These options are recognized:

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must
  // be either 3, or 5, or 6. This influences support for strict
  // mode, the set of reserved words, support for getters and
  // setters and other features. The default is 6.
  ecmaVersion: 6,
  // Source type ("script" or "module") for different semantics
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called
  // when a semicolon is automatically inserted. It will be passed
  // th position of the comma as an offset, and if `locations` is
  // enabled, it is given the location as a `{line, column}` object
  // as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program.
  allowImportExportEverywhere: false,
  // When enabled, hashbang directive in the beginning of file
  // is allowed and treated as a line comment.
  allowHashBang: false,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false,
  plugins: {}
}

// Interpret and default an options object

function getOptions(opts) {
  var options = {}
  for (var opt in defaultOptions)
    options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt]
  if (options.allowReserved == null)
    options.allowReserved = options.ecmaVersion < 5

  if (isArray(options.onToken)) {
    var tokens = options.onToken
    options.onToken = function (token) { return tokens.push(token); }
  }
  if (isArray(options.onComment))
    options.onComment = pushComment(options, options.onComment)

  return options
}

function pushComment(options, array) {
  return function (block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? 'Block' : 'Line',
      value: text,
      start: start,
      end: end
    }
    if (options.locations)
      comment.loc = new SourceLocation(this, startLoc, endLoc)
    if (options.ranges)
      comment.range = [start, end]
    array.push(comment)
  }
}

// Registered plugins
var plugins = {}

function keywordRegexp(words) {
  return new RegExp("^(" + words.replace(/ /g, "|") + ")$")
}

var Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options)
  this.sourceFile = options.sourceFile
  this.keywords = keywordRegexp(keywords[options.ecmaVersion >= 6 ? 6 : 5])
  var reserved = options.allowReserved ? "" :
      reservedWords[options.ecmaVersion] + (options.sourceType == "module" ? " await" : "")
  this.reservedWords = keywordRegexp(reserved)
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict
  this.reservedWordsStrict = keywordRegexp(reservedStrict)
  this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + reservedWords.strictBind)
  this.input = String(input)

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.
  this.containsEsc = false

  // Load plugins
  this.loadPlugins(options.plugins)

  // Set up token state

  // The current position of the tokenizer in the input.
  if (startPos) {
    this.pos = startPos
    this.lineStart = Math.max(0, this.input.lastIndexOf("\n", startPos))
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length
  } else {
    this.pos = this.lineStart = 0
    this.curLine = 1
  }

  // Properties of the current token:
  // Its type
  this.type = tt.eof
  // For tokens that include more information than their type, the value
  this.value = null
  // Its start and end offset
  this.start = this.end = this.pos
  // And, if locations are used, the {line, column} object
  // corresponding to those offsets
  this.startLoc = this.endLoc = this.curPosition()

  // Position information for the previous token
  this.lastTokEndLoc = this.lastTokStartLoc = null
  this.lastTokStart = this.lastTokEnd = this.pos

  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.
  this.context = this.initialContext()
  this.exprAllowed = true

  // Figure out if it's a module code.
  this.strict = this.inModule = options.sourceType === "module"

  // Used to signify the start of a potential arrow function
  this.potentialArrowAt = -1

  // Flags to track whether we are in a function, a generator.
  this.inFunction = this.inGenerator = false
  // Labels in scope.
  this.labels = []

  // If enabled, skip leading hashbang line.
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === '#!')
    this.skipLineComment(2)
};

// DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them
Parser.prototype.isKeyword = function isKeyword (word) { return this.keywords.test(word) };
Parser.prototype.isReservedWord = function isReservedWord (word) { return this.reservedWords.test(word) };

Parser.prototype.extend = function extend (name, f) {
  this[name] = f(this[name])
};

Parser.prototype.loadPlugins = function loadPlugins (pluginConfigs) {
    var this$1 = this;

  for (var name in pluginConfigs) {
    var plugin = plugins[name]
    if (!plugin) throw new Error("Plugin '" + name + "' not found")
    plugin(this$1, pluginConfigs[name])
  }
};

Parser.prototype.parse = function parse () {
  var node = this.options.program || this.startNode()
  this.nextToken()
  return this.parseTopLevel(node)
};

var pp = Parser.prototype

// ## Parser utilities

// Test whether a statement node is the string literal `"use strict"`.

pp.isUseStrict = function(stmt) {
  return this.options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" &&
    stmt.expression.type === "Literal" &&
    stmt.expression.raw.slice(1, -1) === "use strict"
}

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp.eat = function(type) {
  if (this.type === type) {
    this.next()
    return true
  } else {
    return false
  }
}

// Tests whether parsed token is a contextual keyword.

pp.isContextual = function(name) {
  return this.type === tt.name && this.value === name
}

// Consumes contextual keyword if possible.

pp.eatContextual = function(name) {
  return this.value === name && this.eat(tt.name)
}

// Asserts that following token is given contextual keyword.

pp.expectContextual = function(name) {
  if (!this.eatContextual(name)) this.unexpected()
}

// Test whether a semicolon can be inserted at the current position.

pp.canInsertSemicolon = function() {
  return this.type === tt.eof ||
    this.type === tt.braceR ||
    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
}

pp.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon)
      this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc)
    return true
  }
}

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp.semicolon = function() {
  if (!this.eat(tt.semi) && !this.insertSemicolon()) this.unexpected()
}

pp.afterTrailingComma = function(tokType) {
  if (this.type == tokType) {
    if (this.options.onTrailingComma)
      this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc)
    this.next()
    return true
  }
}

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp.expect = function(type) {
  this.eat(type) || this.unexpected()
}

// Raise an unexpected token error.

pp.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token")
}

var DestructuringErrors = function DestructuringErrors() {
  this.shorthandAssign = 0
  this.trailingComma = 0
};

pp.checkPatternErrors = function(refDestructuringErrors, andThrow) {
  var trailing = refDestructuringErrors && refDestructuringErrors.trailingComma
  if (!andThrow) return !!trailing
  if (trailing) this.raise(trailing, "Comma is not permitted after the rest element")
}

pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  var pos = refDestructuringErrors && refDestructuringErrors.shorthandAssign
  if (!andThrow) return !!pos
  if (pos) this.raise(pos, "Shorthand property assignments are valid only in destructuring patterns")
}

var pp$1 = Parser.prototype

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp$1.parseTopLevel = function(node) {
  var this$1 = this;

  var first = true
  if (!node.body) node.body = []
  while (this.type !== tt.eof) {
    var stmt = this$1.parseStatement(true, true)
    node.body.push(stmt)
    if (first) {
      if (this$1.isUseStrict(stmt)) this$1.setStrict(true)
      first = false
    }
  }
  this.next()
  if (this.options.ecmaVersion >= 6) {
    node.sourceType = this.options.sourceType
  }
  return this.finishNode(node, "Program")
}

var loopLabel = {kind: "loop"};
var switchLabel = {kind: "switch"};
pp$1.isLet = function() {
  if (this.type !== tt.name || this.options.ecmaVersion < 6 || this.value != "let") return false
  skipWhiteSpace.lastIndex = this.pos
  var skip = skipWhiteSpace.exec(this.input)
  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next)
  if (nextCh === 91 || nextCh == 123) return true // '{' and '['
  if (isIdentifierStart(nextCh, true)) {
    for (var pos = next + 1; isIdentifierChar(this.input.charCodeAt(pos), true); ++pos) {}
    var ident = this.input.slice(next, pos)
    if (!this.isKeyword(ident)) return true
  }
  return false
}

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp$1.parseStatement = function(declaration, topLevel) {
  var starttype = this.type, node = this.startNode(), kind

  if (this.isLet()) {
    starttype = tt._var
    kind = "let"
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
  case tt._break: case tt._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  case tt._debugger: return this.parseDebuggerStatement(node)
  case tt._do: return this.parseDoStatement(node)
  case tt._for: return this.parseForStatement(node)
  case tt._function:
    if (!declaration && this.options.ecmaVersion >= 6) this.unexpected()
    return this.parseFunctionStatement(node)
  case tt._class:
    if (!declaration) this.unexpected()
    return this.parseClass(node, true)
  case tt._if: return this.parseIfStatement(node)
  case tt._return: return this.parseReturnStatement(node)
  case tt._switch: return this.parseSwitchStatement(node)
  case tt._throw: return this.parseThrowStatement(node)
  case tt._try: return this.parseTryStatement(node)
  case tt._const: case tt._var:
    kind = kind || this.value
    if (!declaration && kind != "var") this.unexpected()
    return this.parseVarStatement(node, kind)
  case tt._while: return this.parseWhileStatement(node)
  case tt._with: return this.parseWithStatement(node)
  case tt.braceL: return this.parseBlock()
  case tt.semi: return this.parseEmptyStatement(node)
  case tt._export:
  case tt._import:
    if (!this.options.allowImportExportEverywhere) {
      if (!topLevel)
        this.raise(this.start, "'import' and 'export' may only appear at the top level")
      if (!this.inModule)
        this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'")
    }
    return starttype === tt._import ? this.parseImport(node) : this.parseExport(node)

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
  default:
    var maybeName = this.value, expr = this.parseExpression()
    if (starttype === tt.name && expr.type === "Identifier" && this.eat(tt.colon))
      return this.parseLabeledStatement(node, maybeName, expr)
    else return this.parseExpressionStatement(node, expr)
  }
}

pp$1.parseBreakContinueStatement = function(node, keyword) {
  var this$1 = this;

  var isBreak = keyword == "break"
  this.next()
  if (this.eat(tt.semi) || this.insertSemicolon()) node.label = null
  else if (this.type !== tt.name) this.unexpected()
  else {
    node.label = this.parseIdent()
    this.semicolon()
  }

  // Verify that there is an actual destination to break or
  // continue to.
  for (var i = 0; i < this.labels.length; ++i) {
    var lab = this$1.labels[i]
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) break
      if (node.label && isBreak) break
    }
  }
  if (i === this.labels.length) this.raise(node.start, "Unsyntactic " + keyword)
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
}

pp$1.parseDebuggerStatement = function(node) {
  this.next()
  this.semicolon()
  return this.finishNode(node, "DebuggerStatement")
}

pp$1.parseDoStatement = function(node) {
  this.next()
  this.labels.push(loopLabel)
  node.body = this.parseStatement(false)
  this.labels.pop()
  this.expect(tt._while)
  node.test = this.parseParenExpression()
  if (this.options.ecmaVersion >= 6)
    this.eat(tt.semi)
  else
    this.semicolon()
  return this.finishNode(node, "DoWhileStatement")
}

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp$1.parseForStatement = function(node) {
  this.next()
  this.labels.push(loopLabel)
  this.expect(tt.parenL)
  if (this.type === tt.semi) return this.parseFor(node, null)
  var isLet = this.isLet()
  if (this.type === tt._var || this.type === tt._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value
    this.next()
    this.parseVar(init$1, true, kind)
    this.finishNode(init$1, "VariableDeclaration")
    if ((this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1 &&
        !(kind !== "var" && init$1.declarations[0].init))
      return this.parseForIn(node, init$1)
    return this.parseFor(node, init$1)
  }
  var refDestructuringErrors = new DestructuringErrors
  var init = this.parseExpression(true, refDestructuringErrors)
  if (this.type === tt._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    this.checkPatternErrors(refDestructuringErrors, true)
    this.toAssignable(init)
    this.checkLVal(init)
    return this.parseForIn(node, init)
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true)
  }
  return this.parseFor(node, init)
}

pp$1.parseFunctionStatement = function(node) {
  this.next()
  return this.parseFunction(node, true)
}

pp$1.parseIfStatement = function(node) {
  this.next()
  node.test = this.parseParenExpression()
  node.consequent = this.parseStatement(false)
  node.alternate = this.eat(tt._else) ? this.parseStatement(false) : null
  return this.finishNode(node, "IfStatement")
}

pp$1.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
    this.raise(this.start, "'return' outside of function")
  this.next()

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(tt.semi) || this.insertSemicolon()) node.argument = null
  else { node.argument = this.parseExpression(); this.semicolon() }
  return this.finishNode(node, "ReturnStatement")
}

pp$1.parseSwitchStatement = function(node) {
  var this$1 = this;

  this.next()
  node.discriminant = this.parseParenExpression()
  node.cases = []
  this.expect(tt.braceL)
  this.labels.push(switchLabel)

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  for (var cur, sawDefault = false; this.type != tt.braceR;) {
    if (this$1.type === tt._case || this$1.type === tt._default) {
      var isCase = this$1.type === tt._case
      if (cur) this$1.finishNode(cur, "SwitchCase")
      node.cases.push(cur = this$1.startNode())
      cur.consequent = []
      this$1.next()
      if (isCase) {
        cur.test = this$1.parseExpression()
      } else {
        if (sawDefault) this$1.raiseRecoverable(this$1.lastTokStart, "Multiple default clauses")
        sawDefault = true
        cur.test = null
      }
      this$1.expect(tt.colon)
    } else {
      if (!cur) this$1.unexpected()
      cur.consequent.push(this$1.parseStatement(true))
    }
  }
  if (cur) this.finishNode(cur, "SwitchCase")
  this.next() // Closing brace
  this.labels.pop()
  return this.finishNode(node, "SwitchStatement")
}

pp$1.parseThrowStatement = function(node) {
  this.next()
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
    this.raise(this.lastTokEnd, "Illegal newline after throw")
  node.argument = this.parseExpression()
  this.semicolon()
  return this.finishNode(node, "ThrowStatement")
}

// Reused empty array added for node fields that are always empty.

var empty = []

pp$1.parseTryStatement = function(node) {
  this.next()
  node.block = this.parseBlock()
  node.handler = null
  if (this.type === tt._catch) {
    var clause = this.startNode()
    this.next()
    this.expect(tt.parenL)
    clause.param = this.parseBindingAtom()
    this.checkLVal(clause.param, true)
    this.expect(tt.parenR)
    clause.body = this.parseBlock()
    node.handler = this.finishNode(clause, "CatchClause")
  }
  node.finalizer = this.eat(tt._finally) ? this.parseBlock() : null
  if (!node.handler && !node.finalizer)
    this.raise(node.start, "Missing catch or finally clause")
  return this.finishNode(node, "TryStatement")
}

pp$1.parseVarStatement = function(node, kind) {
  this.next()
  this.parseVar(node, false, kind)
  this.semicolon()
  return this.finishNode(node, "VariableDeclaration")
}

pp$1.parseWhileStatement = function(node) {
  this.next()
  node.test = this.parseParenExpression()
  this.labels.push(loopLabel)
  node.body = this.parseStatement(false)
  this.labels.pop()
  return this.finishNode(node, "WhileStatement")
}

pp$1.parseWithStatement = function(node) {
  if (this.strict) this.raise(this.start, "'with' in strict mode")
  this.next()
  node.object = this.parseParenExpression()
  node.body = this.parseStatement(false)
  return this.finishNode(node, "WithStatement")
}

pp$1.parseEmptyStatement = function(node) {
  this.next()
  return this.finishNode(node, "EmptyStatement")
}

pp$1.parseLabeledStatement = function(node, maybeName, expr) {
  var this$1 = this;

  for (var i = 0; i < this.labels.length; ++i)
    if (this$1.labels[i].name === maybeName) this$1.raise(expr.start, "Label '" + maybeName + "' is already declared")
  var kind = this.type.isLoop ? "loop" : this.type === tt._switch ? "switch" : null
  for (var i$1 = this.labels.length - 1; i$1 >= 0; i$1--) {
    var label = this$1.labels[i$1]
    if (label.statementStart == node.start) {
      label.statementStart = this$1.start
      label.kind = kind
    } else break
  }
  this.labels.push({name: maybeName, kind: kind, statementStart: this.start})
  node.body = this.parseStatement(true)
  this.labels.pop()
  node.label = expr
  return this.finishNode(node, "LabeledStatement")
}

pp$1.parseExpressionStatement = function(node, expr) {
  node.expression = expr
  this.semicolon()
  return this.finishNode(node, "ExpressionStatement")
}

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp$1.parseBlock = function(allowStrict) {
  var this$1 = this;

  var node = this.startNode(), first = true, oldStrict
  node.body = []
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    var stmt = this$1.parseStatement(true)
    node.body.push(stmt)
    if (first && allowStrict && this$1.isUseStrict(stmt)) {
      oldStrict = this$1.strict
      this$1.setStrict(this$1.strict = true)
    }
    first = false
  }
  if (oldStrict === false) this.setStrict(false)
  return this.finishNode(node, "BlockStatement")
}

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp$1.parseFor = function(node, init) {
  node.init = init
  this.expect(tt.semi)
  node.test = this.type === tt.semi ? null : this.parseExpression()
  this.expect(tt.semi)
  node.update = this.type === tt.parenR ? null : this.parseExpression()
  this.expect(tt.parenR)
  node.body = this.parseStatement(false)
  this.labels.pop()
  return this.finishNode(node, "ForStatement")
}

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp$1.parseForIn = function(node, init) {
  var type = this.type === tt._in ? "ForInStatement" : "ForOfStatement"
  this.next()
  node.left = init
  node.right = this.parseExpression()
  this.expect(tt.parenR)
  node.body = this.parseStatement(false)
  this.labels.pop()
  return this.finishNode(node, type)
}

// Parse a list of variable declarations.

pp$1.parseVar = function(node, isFor, kind) {
  var this$1 = this;

  node.declarations = []
  node.kind = kind
  for (;;) {
    var decl = this$1.startNode()
    this$1.parseVarId(decl)
    if (this$1.eat(tt.eq)) {
      decl.init = this$1.parseMaybeAssign(isFor)
    } else if (kind === "const" && !(this$1.type === tt._in || (this$1.options.ecmaVersion >= 6 && this$1.isContextual("of")))) {
      this$1.unexpected()
    } else if (decl.id.type != "Identifier" && !(isFor && (this$1.type === tt._in || this$1.isContextual("of")))) {
      this$1.raise(this$1.lastTokEnd, "Complex binding patterns require an initialization value")
    } else {
      decl.init = null
    }
    node.declarations.push(this$1.finishNode(decl, "VariableDeclarator"))
    if (!this$1.eat(tt.comma)) break
  }
  return node
}

pp$1.parseVarId = function(decl) {
  decl.id = this.parseBindingAtom()
  this.checkLVal(decl.id, true)
}

// Parse a function declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseFunction = function(node, isStatement, allowExpressionBody) {
  this.initFunction(node)
  if (this.options.ecmaVersion >= 6)
    node.generator = this.eat(tt.star)
  var oldInGen = this.inGenerator
  this.inGenerator = node.generator
  if (isStatement || this.type === tt.name)
    node.id = this.parseIdent()
  this.parseFunctionParams(node)
  this.parseFunctionBody(node, allowExpressionBody)
  this.inGenerator = oldInGen
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression")
}

pp$1.parseFunctionParams = function(node) {
  this.expect(tt.parenL)
  node.params = this.parseBindingList(tt.parenR, false, false, true)
}

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseClass = function(node, isStatement) {
  var this$1 = this;

  this.next()
  this.parseClassId(node, isStatement)
  this.parseClassSuper(node)
  var classBody = this.startNode()
  var hadConstructor = false
  classBody.body = []
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    if (this$1.eat(tt.semi)) continue
    var method = this$1.startNode()
    var isGenerator = this$1.eat(tt.star)
    var isMaybeStatic = this$1.type === tt.name && this$1.value === "static"
    this$1.parsePropertyName(method)
    method.static = isMaybeStatic && this$1.type !== tt.parenL
    if (method.static) {
      if (isGenerator) this$1.unexpected()
      isGenerator = this$1.eat(tt.star)
      this$1.parsePropertyName(method)
    }
    method.kind = "method"
    var isGetSet = false
    if (!method.computed) {
      var key = method.key;
      if (!isGenerator && key.type === "Identifier" && this$1.type !== tt.parenL && (key.name === "get" || key.name === "set")) {
        isGetSet = true
        method.kind = key.name
        key = this$1.parsePropertyName(method)
      }
      if (!method.static && (key.type === "Identifier" && key.name === "constructor" ||
          key.type === "Literal" && key.value === "constructor")) {
        if (hadConstructor) this$1.raise(key.start, "Duplicate constructor in the same class")
        if (isGetSet) this$1.raise(key.start, "Constructor can't have get/set modifier")
        if (isGenerator) this$1.raise(key.start, "Constructor can't be a generator")
        method.kind = "constructor"
        hadConstructor = true
      }
    }
    this$1.parseClassMethod(classBody, method, isGenerator)
    if (isGetSet) {
      var paramCount = method.kind === "get" ? 0 : 1
      if (method.value.params.length !== paramCount) {
        var start = method.value.start
        if (method.kind === "get")
          this$1.raiseRecoverable(start, "getter should have no params")
        else
          this$1.raiseRecoverable(start, "setter should have exactly one param")
      }
      if (method.kind === "set" && method.value.params[0].type === "RestElement")
        this$1.raise(method.value.params[0].start, "Setter cannot use rest params")
    }
  }
  node.body = this.finishNode(classBody, "ClassBody")
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
}

pp$1.parseClassMethod = function(classBody, method, isGenerator) {
  method.value = this.parseMethod(isGenerator)
  classBody.body.push(this.finishNode(method, "MethodDefinition"))
}

pp$1.parseClassId = function(node, isStatement) {
  node.id = this.type === tt.name ? this.parseIdent() : isStatement ? this.unexpected() : null
}

pp$1.parseClassSuper = function(node) {
  node.superClass = this.eat(tt._extends) ? this.parseExprSubscripts() : null
}

// Parses module export declaration.

pp$1.parseExport = function(node) {
  var this$1 = this;

  this.next()
  // export * from '...'
  if (this.eat(tt.star)) {
    this.expectContextual("from")
    node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected()
    this.semicolon()
    return this.finishNode(node, "ExportAllDeclaration")
  }
  if (this.eat(tt._default)) { // export default ...
    var parens = this.type == tt.parenL
    var expr = this.parseMaybeAssign()
    var needsSemi = true
    if (!parens && (expr.type == "FunctionExpression" ||
                    expr.type == "ClassExpression")) {
      needsSemi = false
      if (expr.id) {
        expr.type = expr.type == "FunctionExpression"
          ? "FunctionDeclaration"
          : "ClassDeclaration"
      }
    }
    node.declaration = expr
    if (needsSemi) this.semicolon()
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(true)
    node.specifiers = []
    node.source = null
  } else { // export { x, y as z } [from '...']
    node.declaration = null
    node.specifiers = this.parseExportSpecifiers()
    if (this.eatContextual("from")) {
      node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected()
    } else {
      // check for keywords used as local names
      for (var i = 0; i < node.specifiers.length; i++) {
        if (this$1.keywords.test(node.specifiers[i].local.name) || this$1.reservedWords.test(node.specifiers[i].local.name)) {
          this$1.unexpected(node.specifiers[i].local.start)
        }
      }

      node.source = null
    }
    this.semicolon()
  }
  return this.finishNode(node, "ExportNamedDeclaration")
}

pp$1.shouldParseExportStatement = function() {
  return this.type.keyword || this.isLet()
}

// Parses a comma-separated list of module exports.

pp$1.parseExportSpecifiers = function() {
  var this$1 = this;

  var nodes = [], first = true
  // export { x, y as z } [from '...']
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this$1.expect(tt.comma)
      if (this$1.afterTrailingComma(tt.braceR)) break
    } else first = false

    var node = this$1.startNode()
    node.local = this$1.parseIdent(this$1.type === tt._default)
    node.exported = this$1.eatContextual("as") ? this$1.parseIdent(true) : node.local
    nodes.push(this$1.finishNode(node, "ExportSpecifier"))
  }
  return nodes
}

// Parses import declaration.

pp$1.parseImport = function(node) {
  this.next()
  // import '...'
  if (this.type === tt.string) {
    node.specifiers = empty
    node.source = this.parseExprAtom()
  } else {
    node.specifiers = this.parseImportSpecifiers()
    this.expectContextual("from")
    node.source = this.type === tt.string ? this.parseExprAtom() : this.unexpected()
  }
  this.semicolon()
  return this.finishNode(node, "ImportDeclaration")
}

// Parses a comma-separated list of module imports.

pp$1.parseImportSpecifiers = function() {
  var this$1 = this;

  var nodes = [], first = true
  if (this.type === tt.name) {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode()
    node.local = this.parseIdent()
    this.checkLVal(node.local, true)
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"))
    if (!this.eat(tt.comma)) return nodes
  }
  if (this.type === tt.star) {
    var node$1 = this.startNode()
    this.next()
    this.expectContextual("as")
    node$1.local = this.parseIdent()
    this.checkLVal(node$1.local, true)
    nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"))
    return nodes
  }
  this.expect(tt.braceL)
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this$1.expect(tt.comma)
      if (this$1.afterTrailingComma(tt.braceR)) break
    } else first = false

    var node$2 = this$1.startNode()
    node$2.imported = this$1.parseIdent(true)
    if (this$1.eatContextual("as")) {
      node$2.local = this$1.parseIdent()
    } else {
      node$2.local = node$2.imported
      if (this$1.isKeyword(node$2.local.name)) this$1.unexpected(node$2.local.start)
      if (this$1.reservedWordsStrict.test(node$2.local.name)) this$1.raise(node$2.local.start, "The keyword '" + node$2.local.name + "' is reserved")
    }
    this$1.checkLVal(node$2.local, true)
    nodes.push(this$1.finishNode(node$2, "ImportSpecifier"))
  }
  return nodes
}

var pp$2 = Parser.prototype

// Convert existing expression atom to assignable pattern
// if possible.

pp$2.toAssignable = function(node, isBinding) {
  var this$1 = this;

  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
    case "Identifier":
    case "ObjectPattern":
    case "ArrayPattern":
      break

    case "ObjectExpression":
      node.type = "ObjectPattern"
      for (var i = 0; i < node.properties.length; i++) {
        var prop = node.properties[i]
        if (prop.kind !== "init") this$1.raise(prop.key.start, "Object pattern can't contain getter or setter")
        this$1.toAssignable(prop.value, isBinding)
      }
      break

    case "ArrayExpression":
      node.type = "ArrayPattern"
      this.toAssignableList(node.elements, isBinding)
      break

    case "AssignmentExpression":
      if (node.operator === "=") {
        node.type = "AssignmentPattern"
        delete node.operator
        // falls through to AssignmentPattern
      } else {
        this.raise(node.left.end, "Only '=' operator can be used for specifying default value.")
        break
      }

    case "AssignmentPattern":
      if (node.right.type === "YieldExpression")
        this.raise(node.right.start, "Yield expression cannot be a default value")
      break

    case "ParenthesizedExpression":
      node.expression = this.toAssignable(node.expression, isBinding)
      break

    case "MemberExpression":
      if (!isBinding) break

    default:
      this.raise(node.start, "Assigning to rvalue")
    }
  }
  return node
}

// Convert list of expression atoms to binding list.

pp$2.toAssignableList = function(exprList, isBinding) {
  var this$1 = this;

  var end = exprList.length
  if (end) {
    var last = exprList[end - 1]
    if (last && last.type == "RestElement") {
      --end
    } else if (last && last.type == "SpreadElement") {
      last.type = "RestElement"
      var arg = last.argument
      this.toAssignable(arg, isBinding)
      if (arg.type !== "Identifier" && arg.type !== "MemberExpression" && arg.type !== "ArrayPattern")
        this.unexpected(arg.start)
      --end
    }

    if (isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
      this.unexpected(last.argument.start)
  }
  for (var i = 0; i < end; i++) {
    var elt = exprList[i]
    if (elt) this$1.toAssignable(elt, isBinding)
  }
  return exprList
}

// Parses spread element.

pp$2.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode()
  this.next()
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors)
  return this.finishNode(node, "SpreadElement")
}

pp$2.parseRest = function(allowNonIdent) {
  var node = this.startNode()
  this.next()

  // RestElement inside of a function parameter must be an identifier
  if (allowNonIdent) node.argument = this.type === tt.name ? this.parseIdent() : this.unexpected()
  else node.argument = this.type === tt.name || this.type === tt.bracketL ? this.parseBindingAtom() : this.unexpected()

  return this.finishNode(node, "RestElement")
}

// Parses lvalue (assignable) atom.

pp$2.parseBindingAtom = function() {
  if (this.options.ecmaVersion < 6) return this.parseIdent()
  switch (this.type) {
  case tt.name:
    return this.parseIdent()

  case tt.bracketL:
    var node = this.startNode()
    this.next()
    node.elements = this.parseBindingList(tt.bracketR, true, true)
    return this.finishNode(node, "ArrayPattern")

  case tt.braceL:
    return this.parseObj(true)

  default:
    this.unexpected()
  }
}

pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowNonIdent) {
  var this$1 = this;

  var elts = [], first = true
  while (!this.eat(close)) {
    if (first) first = false
    else this$1.expect(tt.comma)
    if (allowEmpty && this$1.type === tt.comma) {
      elts.push(null)
    } else if (allowTrailingComma && this$1.afterTrailingComma(close)) {
      break
    } else if (this$1.type === tt.ellipsis) {
      var rest = this$1.parseRest(allowNonIdent)
      this$1.parseBindingListItem(rest)
      elts.push(rest)
      if (this$1.type === tt.comma) this$1.raise(this$1.start, "Comma is not permitted after the rest element")
      this$1.expect(close)
      break
    } else {
      var elem = this$1.parseMaybeDefault(this$1.start, this$1.startLoc)
      this$1.parseBindingListItem(elem)
      elts.push(elem)
    }
  }
  return elts
}

pp$2.parseBindingListItem = function(param) {
  return param
}

// Parses assignment pattern around given atom if possible.

pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom()
  if (this.options.ecmaVersion < 6 || !this.eat(tt.eq)) return left
  var node = this.startNodeAt(startPos, startLoc)
  node.left = left
  node.right = this.parseMaybeAssign()
  return this.finishNode(node, "AssignmentPattern")
}

// Verify that a node is an lval — something that can be assigned
// to.

pp$2.checkLVal = function(expr, isBinding, checkClashes) {
  var this$1 = this;

  switch (expr.type) {
  case "Identifier":
    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
      this.raiseRecoverable(expr.start, (isBinding ? "Binding " : "Assigning to ") + expr.name + " in strict mode")
    if (checkClashes) {
      if (has(checkClashes, expr.name))
        this.raiseRecoverable(expr.start, "Argument name clash")
      checkClashes[expr.name] = true
    }
    break

  case "MemberExpression":
    if (isBinding) this.raiseRecoverable(expr.start, (isBinding ? "Binding" : "Assigning to") + " member expression")
    break

  case "ObjectPattern":
    for (var i = 0; i < expr.properties.length; i++)
      this$1.checkLVal(expr.properties[i].value, isBinding, checkClashes)
    break

  case "ArrayPattern":
    for (var i$1 = 0; i$1 < expr.elements.length; i$1++) {
      var elem = expr.elements[i$1]
      if (elem) this$1.checkLVal(elem, isBinding, checkClashes)
    }
    break

  case "AssignmentPattern":
    this.checkLVal(expr.left, isBinding, checkClashes)
    break

  case "RestElement":
    this.checkLVal(expr.argument, isBinding, checkClashes)
    break

  case "ParenthesizedExpression":
    this.checkLVal(expr.expression, isBinding, checkClashes)
    break

  default:
    this.raise(expr.start, (isBinding ? "Binding" : "Assigning to") + " rvalue")
  }
}

// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

var pp$3 = Parser.prototype

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp$3.checkPropClash = function(prop, propHash) {
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
    return
  var key = prop.key;
  var name
  switch (key.type) {
  case "Identifier": name = key.name; break
  case "Literal": name = String(key.value); break
  default: return
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) this.raiseRecoverable(key.start, "Redefinition of __proto__ property")
      propHash.proto = true
    }
    return
  }
  name = "$" + name
  var other = propHash[name]
  if (other) {
    var isGetSet = kind !== "init"
    if ((this.strict || isGetSet) && other[kind] || !(isGetSet ^ other.init))
      this.raiseRecoverable(key.start, "Redefinition of property")
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    }
  }
  other[kind] = true
}

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp$3.parseExpression = function(noIn, refDestructuringErrors) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc
  var expr = this.parseMaybeAssign(noIn, refDestructuringErrors)
  if (this.type === tt.comma) {
    var node = this.startNodeAt(startPos, startLoc)
    node.expressions = [expr]
    while (this.eat(tt.comma)) node.expressions.push(this$1.parseMaybeAssign(noIn, refDestructuringErrors))
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
}

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
  if (this.inGenerator && this.isContextual("yield")) return this.parseYield()

  var ownDestructuringErrors = false
  if (!refDestructuringErrors) {
    refDestructuringErrors = new DestructuringErrors
    ownDestructuringErrors = true
  }
  var startPos = this.start, startLoc = this.startLoc
  if (this.type == tt.parenL || this.type == tt.name)
    this.potentialArrowAt = this.start
  var left = this.parseMaybeConditional(noIn, refDestructuringErrors)
  if (afterLeftParse) left = afterLeftParse.call(this, left, startPos, startLoc)
  if (this.type.isAssign) {
    this.checkPatternErrors(refDestructuringErrors, true)
    if (!ownDestructuringErrors) DestructuringErrors.call(refDestructuringErrors)
    var node = this.startNodeAt(startPos, startLoc)
    node.operator = this.value
    node.left = this.type === tt.eq ? this.toAssignable(left) : left
    refDestructuringErrors.shorthandAssign = 0 // reset because shorthand default was used correctly
    this.checkLVal(left)
    this.next()
    node.right = this.parseMaybeAssign(noIn)
    return this.finishNode(node, "AssignmentExpression")
  } else {
    if (ownDestructuringErrors) this.checkExpressionErrors(refDestructuringErrors, true)
  }
  return left
}

// Parse a ternary conditional (`?:`) operator.

pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc
  var expr = this.parseExprOps(noIn, refDestructuringErrors)
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr
  if (this.eat(tt.question)) {
    var node = this.startNodeAt(startPos, startLoc)
    node.test = expr
    node.consequent = this.parseMaybeAssign()
    this.expect(tt.colon)
    node.alternate = this.parseMaybeAssign(noIn)
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
}

// Start the precedence parser.

pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc
  var expr = this.parseMaybeUnary(refDestructuringErrors, false)
  if (this.checkExpressionErrors(refDestructuringErrors)) return expr
  return this.parseExprOp(expr, startPos, startLoc, -1, noIn)
}

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
  var prec = this.type.binop
  if (prec != null && (!noIn || this.type !== tt._in)) {
    if (prec > minPrec) {
      var logical = this.type === tt.logicalOR || this.type === tt.logicalAND
      var op = this.value
      this.next()
      var startPos = this.start, startLoc = this.startLoc
      var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn)
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical)
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
    }
  }
  return left
}

pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  var node = this.startNodeAt(startPos, startLoc)
  node.left = left
  node.operator = op
  node.right = right
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
}

// Parse unary operators, both prefix and postfix.

pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, expr
  if (this.type.prefix) {
    var node = this.startNode(), update = this.type === tt.incDec
    node.operator = this.value
    node.prefix = true
    this.next()
    node.argument = this.parseMaybeUnary(null, true)
    this.checkExpressionErrors(refDestructuringErrors, true)
    if (update) this.checkLVal(node.argument)
    else if (this.strict && node.operator === "delete" &&
             node.argument.type === "Identifier")
      this.raiseRecoverable(node.start, "Deleting local variable in strict mode")
    else sawUnary = true
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression")
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors)
    if (this.checkExpressionErrors(refDestructuringErrors)) return expr
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this$1.startNodeAt(startPos, startLoc)
      node$1.operator = this$1.value
      node$1.prefix = false
      node$1.argument = expr
      this$1.checkLVal(expr)
      this$1.next()
      expr = this$1.finishNode(node$1, "UpdateExpression")
    }
  }

  if (!sawUnary && this.eat(tt.starstar))
    return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false)
  else
    return expr
}

// Parse call, dot, and `[]`-subscript expressions.

pp$3.parseExprSubscripts = function(refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc
  var expr = this.parseExprAtom(refDestructuringErrors)
  var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")"
  if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) return expr
  return this.parseSubscripts(expr, startPos, startLoc)
}

pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
  var this$1 = this;

  for (;;) {
    if (this$1.eat(tt.dot)) {
      var node = this$1.startNodeAt(startPos, startLoc)
      node.object = base
      node.property = this$1.parseIdent(true)
      node.computed = false
      base = this$1.finishNode(node, "MemberExpression")
    } else if (this$1.eat(tt.bracketL)) {
      var node$1 = this$1.startNodeAt(startPos, startLoc)
      node$1.object = base
      node$1.property = this$1.parseExpression()
      node$1.computed = true
      this$1.expect(tt.bracketR)
      base = this$1.finishNode(node$1, "MemberExpression")
    } else if (!noCalls && this$1.eat(tt.parenL)) {
      var node$2 = this$1.startNodeAt(startPos, startLoc)
      node$2.callee = base
      node$2.arguments = this$1.parseExprList(tt.parenR, false)
      base = this$1.finishNode(node$2, "CallExpression")
    } else if (this$1.type === tt.backQuote) {
      var node$3 = this$1.startNodeAt(startPos, startLoc)
      node$3.tag = base
      node$3.quasi = this$1.parseTemplate()
      base = this$1.finishNode(node$3, "TaggedTemplateExpression")
    } else {
      return base
    }
  }
}

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp$3.parseExprAtom = function(refDestructuringErrors) {
  var node, canBeArrow = this.potentialArrowAt == this.start
  switch (this.type) {
  case tt._super:
    if (!this.inFunction)
      this.raise(this.start, "'super' outside of function or class")

  case tt._this:
    var type = this.type === tt._this ? "ThisExpression" : "Super"
    node = this.startNode()
    this.next()
    return this.finishNode(node, type)

  case tt.name:
    var startPos = this.start, startLoc = this.startLoc
    var id = this.parseIdent(this.type !== tt.name)
    if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow))
      return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id])
    return id

  case tt.regexp:
    var value = this.value
    node = this.parseLiteral(value.value)
    node.regex = {pattern: value.pattern, flags: value.flags}
    return node

  case tt.num: case tt.string:
    return this.parseLiteral(this.value)

  case tt._null: case tt._true: case tt._false:
    node = this.startNode()
    node.value = this.type === tt._null ? null : this.type === tt._true
    node.raw = this.type.keyword
    this.next()
    return this.finishNode(node, "Literal")

  case tt.parenL:
    return this.parseParenAndDistinguishExpression(canBeArrow)

  case tt.bracketL:
    node = this.startNode()
    this.next()
    node.elements = this.parseExprList(tt.bracketR, true, true, refDestructuringErrors)
    return this.finishNode(node, "ArrayExpression")

  case tt.braceL:
    return this.parseObj(false, refDestructuringErrors)

  case tt._function:
    node = this.startNode()
    this.next()
    return this.parseFunction(node, false)

  case tt._class:
    return this.parseClass(this.startNode(), false)

  case tt._new:
    return this.parseNew()

  case tt.backQuote:
    return this.parseTemplate()

  default:
    this.unexpected()
  }
}

pp$3.parseLiteral = function(value) {
  var node = this.startNode()
  node.value = value
  node.raw = this.input.slice(this.start, this.end)
  this.next()
  return this.finishNode(node, "Literal")
}

pp$3.parseParenExpression = function() {
  this.expect(tt.parenL)
  var val = this.parseExpression()
  this.expect(tt.parenR)
  return val
}

pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, val
  if (this.options.ecmaVersion >= 6) {
    this.next()

    var innerStartPos = this.start, innerStartLoc = this.startLoc
    var exprList = [], first = true
    var refDestructuringErrors = new DestructuringErrors, spreadStart, innerParenStart
    while (this.type !== tt.parenR) {
      first ? first = false : this$1.expect(tt.comma)
      if (this$1.type === tt.ellipsis) {
        spreadStart = this$1.start
        exprList.push(this$1.parseParenItem(this$1.parseRest()))
        break
      } else {
        if (this$1.type === tt.parenL && !innerParenStart) {
          innerParenStart = this$1.start
        }
        exprList.push(this$1.parseMaybeAssign(false, refDestructuringErrors, this$1.parseParenItem))
      }
    }
    var innerEndPos = this.start, innerEndLoc = this.startLoc
    this.expect(tt.parenR)

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(tt.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, true)
      if (innerParenStart) this.unexpected(innerParenStart)
      return this.parseParenArrowList(startPos, startLoc, exprList)
    }

    if (!exprList.length) this.unexpected(this.lastTokStart)
    if (spreadStart) this.unexpected(spreadStart)
    this.checkExpressionErrors(refDestructuringErrors, true)

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc)
      val.expressions = exprList
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc)
    } else {
      val = exprList[0]
    }
  } else {
    val = this.parseParenExpression()
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc)
    par.expression = val
    return this.finishNode(par, "ParenthesizedExpression")
  } else {
    return val
  }
}

pp$3.parseParenItem = function(item) {
  return item
}

pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList)
}

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty$1 = []

pp$3.parseNew = function() {
  var node = this.startNode()
  var meta = this.parseIdent(true)
  if (this.options.ecmaVersion >= 6 && this.eat(tt.dot)) {
    node.meta = meta
    node.property = this.parseIdent(true)
    if (node.property.name !== "target")
      this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target")
    if (!this.inFunction)
      this.raiseRecoverable(node.start, "new.target can only be used in functions")
    return this.finishNode(node, "MetaProperty")
  }
  var startPos = this.start, startLoc = this.startLoc
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true)
  if (this.eat(tt.parenL)) node.arguments = this.parseExprList(tt.parenR, false)
  else node.arguments = empty$1
  return this.finishNode(node, "NewExpression")
}

// Parse template expression.

pp$3.parseTemplateElement = function() {
  var elem = this.startNode()
  elem.value = {
    raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, '\n'),
    cooked: this.value
  }
  this.next()
  elem.tail = this.type === tt.backQuote
  return this.finishNode(elem, "TemplateElement")
}

pp$3.parseTemplate = function() {
  var this$1 = this;

  var node = this.startNode()
  this.next()
  node.expressions = []
  var curElt = this.parseTemplateElement()
  node.quasis = [curElt]
  while (!curElt.tail) {
    this$1.expect(tt.dollarBraceL)
    node.expressions.push(this$1.parseExpression())
    this$1.expect(tt.braceR)
    node.quasis.push(curElt = this$1.parseTemplateElement())
  }
  this.next()
  return this.finishNode(node, "TemplateLiteral")
}

// Parse an object literal or binding pattern.

pp$3.parseObj = function(isPattern, refDestructuringErrors) {
  var this$1 = this;

  var node = this.startNode(), first = true, propHash = {}
  node.properties = []
  this.next()
  while (!this.eat(tt.braceR)) {
    if (!first) {
      this$1.expect(tt.comma)
      if (this$1.afterTrailingComma(tt.braceR)) break
    } else first = false

    var prop = this$1.startNode(), isGenerator, startPos, startLoc
    if (this$1.options.ecmaVersion >= 6) {
      prop.method = false
      prop.shorthand = false
      if (isPattern || refDestructuringErrors) {
        startPos = this$1.start
        startLoc = this$1.startLoc
      }
      if (!isPattern)
        isGenerator = this$1.eat(tt.star)
    }
    this$1.parsePropertyName(prop)
    this$1.parsePropertyValue(prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors)
    this$1.checkPropClash(prop, propHash)
    node.properties.push(this$1.finishNode(prop, "Property"))
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
}

pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, startPos, startLoc, refDestructuringErrors) {
  if (this.eat(tt.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors)
    prop.kind = "init"
  } else if (this.options.ecmaVersion >= 6 && this.type === tt.parenL) {
    if (isPattern) this.unexpected()
    prop.kind = "init"
    prop.method = true
    prop.value = this.parseMethod(isGenerator)
  } else if (this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
             (prop.key.name === "get" || prop.key.name === "set") &&
             (this.type != tt.comma && this.type != tt.braceR)) {
    if (isGenerator || isPattern) this.unexpected()
    prop.kind = prop.key.name
    this.parsePropertyName(prop)
    prop.value = this.parseMethod(false)
    var paramCount = prop.kind === "get" ? 0 : 1
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start
      if (prop.kind === "get")
        this.raiseRecoverable(start, "getter should have no params")
      else
        this.raiseRecoverable(start, "setter should have exactly one param")
    }
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
      this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params")
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (this.keywords.test(prop.key.name) ||
        (this.strict ? this.reservedWordsStrictBind : this.reservedWords).test(prop.key.name) ||
        (this.inGenerator && prop.key.name == "yield"))
      this.raiseRecoverable(prop.key.start, "'" + prop.key.name + "' can not be used as shorthand property")
    prop.kind = "init"
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key)
    } else if (this.type === tt.eq && refDestructuringErrors) {
      if (!refDestructuringErrors.shorthandAssign)
        refDestructuringErrors.shorthandAssign = this.start
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key)
    } else {
      prop.value = prop.key
    }
    prop.shorthand = true
  } else this.unexpected()
}

pp$3.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(tt.bracketL)) {
      prop.computed = true
      prop.key = this.parseMaybeAssign()
      this.expect(tt.bracketR)
      return prop.key
    } else {
      prop.computed = false
    }
  }
  return prop.key = this.type === tt.num || this.type === tt.string ? this.parseExprAtom() : this.parseIdent(true)
}

// Initialize empty function node.

pp$3.initFunction = function(node) {
  node.id = null
  if (this.options.ecmaVersion >= 6) {
    node.generator = false
    node.expression = false
  }
}

// Parse object or class method.

pp$3.parseMethod = function(isGenerator) {
  var node = this.startNode(), oldInGen = this.inGenerator
  this.inGenerator = isGenerator
  this.initFunction(node)
  this.expect(tt.parenL)
  node.params = this.parseBindingList(tt.parenR, false, false)
  if (this.options.ecmaVersion >= 6)
    node.generator = isGenerator
  this.parseFunctionBody(node, false)
  this.inGenerator = oldInGen
  return this.finishNode(node, "FunctionExpression")
}

// Parse arrow function expression with given parameters.

pp$3.parseArrowExpression = function(node, params) {
  var oldInGen = this.inGenerator
  this.inGenerator = false
  this.initFunction(node)
  node.params = this.toAssignableList(params, true)
  this.parseFunctionBody(node, true)
  this.inGenerator = oldInGen
  return this.finishNode(node, "ArrowFunctionExpression")
}

// Parse function body and check parameters.

pp$3.parseFunctionBody = function(node, isArrowFunction) {
  var isExpression = isArrowFunction && this.type !== tt.braceL

  if (isExpression) {
    node.body = this.parseMaybeAssign()
    node.expression = true
  } else {
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldInFunc = this.inFunction, oldLabels = this.labels
    this.inFunction = true; this.labels = []
    node.body = this.parseBlock(true)
    node.expression = false
    this.inFunction = oldInFunc; this.labels = oldLabels
  }

  // If this is a strict mode function, verify that argument names
  // are not repeated, and it does not try to bind the words `eval`
  // or `arguments`.
  var useStrict = (!isExpression && node.body.body.length && this.isUseStrict(node.body.body[0])) ? node.body.body[0] : null;
  if (this.strict || useStrict) {
    var oldStrict = this.strict
    this.strict = true
    if (node.id)
      this.checkLVal(node.id, true)
    this.checkParams(node, useStrict)
    this.strict = oldStrict
  } else if (isArrowFunction) {
    this.checkParams(node, useStrict)
  }
}

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp$3.checkParams = function(node, useStrict) {
    var this$1 = this;

    var nameHash = {}
    for (var i = 0; i < node.params.length; i++) {
      if (useStrict && this$1.options.ecmaVersion >= 7 && node.params[i].type !== "Identifier")
        this$1.raiseRecoverable(useStrict.start, "Illegal 'use strict' directive in function with non-simple parameter list");
      this$1.checkLVal(node.params[i], true, nameHash)
    }
}

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var this$1 = this;

  var elts = [], first = true
  while (!this.eat(close)) {
    if (!first) {
      this$1.expect(tt.comma)
      if (allowTrailingComma && this$1.afterTrailingComma(close)) break
    } else first = false

    var elt
    if (allowEmpty && this$1.type === tt.comma)
      elt = null
    else if (this$1.type === tt.ellipsis) {
      elt = this$1.parseSpread(refDestructuringErrors)
      if (this$1.type === tt.comma && refDestructuringErrors && !refDestructuringErrors.trailingComma) {
        refDestructuringErrors.trailingComma = this$1.lastTokStart
      }
    } else
      elt = this$1.parseMaybeAssign(false, refDestructuringErrors)
    elts.push(elt)
  }
  return elts
}

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp$3.parseIdent = function(liberal) {
  var node = this.startNode()
  if (liberal && this.options.allowReserved == "never") liberal = false
  if (this.type === tt.name) {
    if (!liberal && (this.strict ? this.reservedWordsStrict : this.reservedWords).test(this.value) &&
        (this.options.ecmaVersion >= 6 ||
         this.input.slice(this.start, this.end).indexOf("\\") == -1))
      this.raiseRecoverable(this.start, "The keyword '" + this.value + "' is reserved")
    if (!liberal && this.inGenerator && this.value === "yield")
      this.raiseRecoverable(this.start, "Can not use 'yield' as identifier inside a generator")
    node.name = this.value
  } else if (liberal && this.type.keyword) {
    node.name = this.type.keyword
  } else {
    this.unexpected()
  }
  this.next()
  return this.finishNode(node, "Identifier")
}

// Parses yield expression inside generator.

pp$3.parseYield = function() {
  var node = this.startNode()
  this.next()
  if (this.type == tt.semi || this.canInsertSemicolon() || (this.type != tt.star && !this.type.startsExpr)) {
    node.delegate = false
    node.argument = null
  } else {
    node.delegate = this.eat(tt.star)
    node.argument = this.parseMaybeAssign()
  }
  return this.finishNode(node, "YieldExpression")
}

var pp$4 = Parser.prototype

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos)
  message += " (" + loc.line + ":" + loc.column + ")"
  var err = new SyntaxError(message)
  err.pos = pos; err.loc = loc; err.raisedAt = this.pos
  throw err
}

pp$4.raiseRecoverable = pp$4.raise

pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
}

var Node = function Node(parser, pos, loc) {
  this.type = ""
  this.start = pos
  this.end = 0
  if (parser.options.locations)
    this.loc = new SourceLocation(parser, loc)
  if (parser.options.directSourceFile)
    this.sourceFile = parser.options.directSourceFile
  if (parser.options.ranges)
    this.range = [pos, 0]
};

// Start an AST node, attaching a start offset.

var pp$5 = Parser.prototype

pp$5.startNode = function() {
  return new Node(this, this.start, this.startLoc)
}

pp$5.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
}

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type
  node.end = pos
  if (this.options.locations)
    node.loc.end = loc
  if (this.options.ranges)
    node.range[1] = pos
  return node
}

pp$5.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
}

// Finish node at given position

pp$5.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
}

// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design

var TokContext = function TokContext(token, isExpr, preserveSpace, override) {
  this.token = token
  this.isExpr = !!isExpr
  this.preserveSpace = !!preserveSpace
  this.override = override
};

var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", true),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) { return p.readTmplToken(); }),
  f_expr: new TokContext("function", true)
}

var pp$6 = Parser.prototype

pp$6.initialContext = function() {
  return [types.b_stat]
}

pp$6.braceIsBlock = function(prevType) {
  if (prevType === tt.colon) {
    var parent = this.curContext()
    if (parent === types.b_stat || parent === types.b_expr)
      return !parent.isExpr
  }
  if (prevType === tt._return)
    return lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  if (prevType === tt._else || prevType === tt.semi || prevType === tt.eof || prevType === tt.parenR)
    return true
  if (prevType == tt.braceL)
    return this.curContext() === types.b_stat
  return !this.exprAllowed
}

pp$6.updateContext = function(prevType) {
  var update, type = this.type
  if (type.keyword && prevType == tt.dot)
    this.exprAllowed = false
  else if (update = type.updateContext)
    update.call(this, prevType)
  else
    this.exprAllowed = type.beforeExpr
}

// Token-specific context update code

tt.parenR.updateContext = tt.braceR.updateContext = function() {
  if (this.context.length == 1) {
    this.exprAllowed = true
    return
  }
  var out = this.context.pop()
  if (out === types.b_stat && this.curContext() === types.f_expr) {
    this.context.pop()
    this.exprAllowed = false
  } else if (out === types.b_tmpl) {
    this.exprAllowed = true
  } else {
    this.exprAllowed = !out.isExpr
  }
}

tt.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr)
  this.exprAllowed = true
}

tt.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl)
  this.exprAllowed = true
}

tt.parenL.updateContext = function(prevType) {
  var statementParens = prevType === tt._if || prevType === tt._for || prevType === tt._with || prevType === tt._while
  this.context.push(statementParens ? types.p_stat : types.p_expr)
  this.exprAllowed = true
}

tt.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
}

tt._function.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== tt.semi && prevType !== tt._else &&
      !((prevType === tt.colon || prevType === tt.braceL) && this.curContext() === types.b_stat))
    this.context.push(types.f_expr)
  this.exprAllowed = false
}

tt.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl)
    this.context.pop()
  else
    this.context.push(types.q_tmpl)
  this.exprAllowed = false
}

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  this.type = p.type
  this.value = p.value
  this.start = p.start
  this.end = p.end
  if (p.options.locations)
    this.loc = new SourceLocation(p, p.startLoc, p.endLoc)
  if (p.options.ranges)
    this.range = [p.start, p.end]
};

// ## Tokenizer

var pp$7 = Parser.prototype

// Are we running under Rhino?
var isRhino = typeof Packages == "object" && Object.prototype.toString.call(Packages) == "[object JavaPackage]"

// Move to the next token

pp$7.next = function() {
  if (this.options.onToken)
    this.options.onToken(new Token(this))

  this.lastTokEnd = this.end
  this.lastTokStart = this.start
  this.lastTokEndLoc = this.endLoc
  this.lastTokStartLoc = this.startLoc
  this.nextToken()
}

pp$7.getToken = function() {
  this.next()
  return new Token(this)
}

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined")
  pp$7[Symbol.iterator] = function () {
    var self = this
    return {next: function () {
      var token = self.getToken()
      return {
        done: token.type === tt.eof,
        value: token
      }
    }}
  }

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

pp$7.setStrict = function(strict) {
  var this$1 = this;

  this.strict = strict
  if (this.type !== tt.num && this.type !== tt.string) return
  this.pos = this.start
  if (this.options.locations) {
    while (this.pos < this.lineStart) {
      this$1.lineStart = this$1.input.lastIndexOf("\n", this$1.lineStart - 2) + 1
      --this$1.curLine
    }
  }
  this.nextToken()
}

pp$7.curContext = function() {
  return this.context[this.context.length - 1]
}

// Read a single token, updating the parser object's token-related
// properties.

pp$7.nextToken = function() {
  var curContext = this.curContext()
  if (!curContext || !curContext.preserveSpace) this.skipSpace()

  this.start = this.pos
  if (this.options.locations) this.startLoc = this.curPosition()
  if (this.pos >= this.input.length) return this.finishToken(tt.eof)

  if (curContext.override) return curContext.override(this)
  else this.readToken(this.fullCharCodeAtPos())
}

pp$7.readToken = function(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
    return this.readWord()

  return this.getTokenFromCode(code)
}

pp$7.fullCharCodeAtPos = function() {
  var code = this.input.charCodeAt(this.pos)
  if (code <= 0xd7ff || code >= 0xe000) return code
  var next = this.input.charCodeAt(this.pos + 1)
  return (code << 10) + next - 0x35fdc00
}

pp$7.skipBlockComment = function() {
  var this$1 = this;

  var startLoc = this.options.onComment && this.curPosition()
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2)
  if (end === -1) this.raise(this.pos - 2, "Unterminated comment")
  this.pos = end + 2
  if (this.options.locations) {
    lineBreakG.lastIndex = start
    var match
    while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
      ++this$1.curLine
      this$1.lineStart = match.index + match[0].length
    }
  }
  if (this.options.onComment)
    this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                           startLoc, this.curPosition())
}

pp$7.skipLineComment = function(startSkip) {
  var this$1 = this;

  var start = this.pos
  var startLoc = this.options.onComment && this.curPosition()
  var ch = this.input.charCodeAt(this.pos+=startSkip)
  while (this.pos < this.input.length && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
    ++this$1.pos
    ch = this$1.input.charCodeAt(this$1.pos)
  }
  if (this.options.onComment)
    this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                           startLoc, this.curPosition())
}

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp$7.skipSpace = function() {
  var this$1 = this;

  loop: while (this.pos < this.input.length) {
    var ch = this$1.input.charCodeAt(this$1.pos)
    switch (ch) {
      case 32: case 160: // ' '
        ++this$1.pos
        break
      case 13:
        if (this$1.input.charCodeAt(this$1.pos + 1) === 10) {
          ++this$1.pos
        }
      case 10: case 8232: case 8233:
        ++this$1.pos
        if (this$1.options.locations) {
          ++this$1.curLine
          this$1.lineStart = this$1.pos
        }
        break
      case 47: // '/'
        switch (this$1.input.charCodeAt(this$1.pos + 1)) {
          case 42: // '*'
            this$1.skipBlockComment()
            break
          case 47:
            this$1.skipLineComment(2)
            break
          default:
            break loop
        }
        break
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this$1.pos
        } else {
          break loop
        }
    }
  }
}

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp$7.finishToken = function(type, val) {
  this.end = this.pos
  if (this.options.locations) this.endLoc = this.curPosition()
  var prevType = this.type
  this.type = type
  this.value = val

  this.updateContext(prevType)
}

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp$7.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1)
  if (next >= 48 && next <= 57) return this.readNumber(true)
  var next2 = this.input.charCodeAt(this.pos + 2)
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
    this.pos += 3
    return this.finishToken(tt.ellipsis)
  } else {
    ++this.pos
    return this.finishToken(tt.dot)
  }
}

pp$7.readToken_slash = function() { // '/'
  var next = this.input.charCodeAt(this.pos + 1)
  if (this.exprAllowed) {++this.pos; return this.readRegexp()}
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(tt.slash, 1)
}

pp$7.readToken_mult_modulo_exp = function(code) { // '%*'
  var next = this.input.charCodeAt(this.pos + 1)
  var size = 1
  var tokentype = code === 42 ? tt.star : tt.modulo

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && next === 42) {
    ++size
    tokentype = tt.starstar
    next = this.input.charCodeAt(this.pos + 2)
  }

  if (next === 61) return this.finishOp(tt.assign, size + 1)
  return this.finishOp(tokentype, size)
}

pp$7.readToken_pipe_amp = function(code) { // '|&'
  var next = this.input.charCodeAt(this.pos + 1)
  if (next === code) return this.finishOp(code === 124 ? tt.logicalOR : tt.logicalAND, 2)
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(code === 124 ? tt.bitwiseOR : tt.bitwiseAND, 1)
}

pp$7.readToken_caret = function() { // '^'
  var next = this.input.charCodeAt(this.pos + 1)
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(tt.bitwiseXOR, 1)
}

pp$7.readToken_plus_min = function(code) { // '+-'
  var next = this.input.charCodeAt(this.pos + 1)
  if (next === code) {
    if (next == 45 && this.input.charCodeAt(this.pos + 2) == 62 &&
        lineBreak.test(this.input.slice(this.lastTokEnd, this.pos))) {
      // A `-->` line comment
      this.skipLineComment(3)
      this.skipSpace()
      return this.nextToken()
    }
    return this.finishOp(tt.incDec, 2)
  }
  if (next === 61) return this.finishOp(tt.assign, 2)
  return this.finishOp(tt.plusMin, 1)
}

pp$7.readToken_lt_gt = function(code) { // '<>'
  var next = this.input.charCodeAt(this.pos + 1)
  var size = 1
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2
    if (this.input.charCodeAt(this.pos + size) === 61) return this.finishOp(tt.assign, size + 1)
    return this.finishOp(tt.bitShift, size)
  }
  if (next == 33 && code == 60 && this.input.charCodeAt(this.pos + 2) == 45 &&
      this.input.charCodeAt(this.pos + 3) == 45) {
    if (this.inModule) this.unexpected()
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4)
    this.skipSpace()
    return this.nextToken()
  }
  if (next === 61) size = 2
  return this.finishOp(tt.relational, size)
}

pp$7.readToken_eq_excl = function(code) { // '=!'
  var next = this.input.charCodeAt(this.pos + 1)
  if (next === 61) return this.finishOp(tt.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2)
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
    this.pos += 2
    return this.finishToken(tt.arrow)
  }
  return this.finishOp(code === 61 ? tt.eq : tt.prefix, 1)
}

pp$7.getTokenFromCode = function(code) {
  switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
  case 46: // '.'
    return this.readToken_dot()

    // Punctuation tokens.
  case 40: ++this.pos; return this.finishToken(tt.parenL)
  case 41: ++this.pos; return this.finishToken(tt.parenR)
  case 59: ++this.pos; return this.finishToken(tt.semi)
  case 44: ++this.pos; return this.finishToken(tt.comma)
  case 91: ++this.pos; return this.finishToken(tt.bracketL)
  case 93: ++this.pos; return this.finishToken(tt.bracketR)
  case 123: ++this.pos; return this.finishToken(tt.braceL)
  case 125: ++this.pos; return this.finishToken(tt.braceR)
  case 58: ++this.pos; return this.finishToken(tt.colon)
  case 63: ++this.pos; return this.finishToken(tt.question)

  case 96: // '`'
    if (this.options.ecmaVersion < 6) break
    ++this.pos
    return this.finishToken(tt.backQuote)

  case 48: // '0'
    var next = this.input.charCodeAt(this.pos + 1)
    if (next === 120 || next === 88) return this.readRadixNumber(16) // '0x', '0X' - hex number
    if (this.options.ecmaVersion >= 6) {
      if (next === 111 || next === 79) return this.readRadixNumber(8) // '0o', '0O' - octal number
      if (next === 98 || next === 66) return this.readRadixNumber(2) // '0b', '0B' - binary number
    }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return this.readNumber(false)

    // Quotes produce strings.
  case 34: case 39: // '"', "'"
    return this.readString(code)

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

  case 47: // '/'
    return this.readToken_slash()

  case 37: case 42: // '%*'
    return this.readToken_mult_modulo_exp(code)

  case 124: case 38: // '|&'
    return this.readToken_pipe_amp(code)

  case 94: // '^'
    return this.readToken_caret()

  case 43: case 45: // '+-'
    return this.readToken_plus_min(code)

  case 60: case 62: // '<>'
    return this.readToken_lt_gt(code)

  case 61: case 33: // '=!'
    return this.readToken_eq_excl(code)

  case 126: // '~'
    return this.finishOp(tt.prefix, 1)
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'")
}

pp$7.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size)
  this.pos += size
  return this.finishToken(type, str)
}

// Parse a regular expression. Some context-awareness is necessary,
// since a '/' inside a '[]' set does not end the expression.

function tryCreateRegexp(src, flags, throwErrorAt, parser) {
  try {
    return new RegExp(src, flags)
  } catch (e) {
    if (throwErrorAt !== undefined) {
      if (e instanceof SyntaxError) parser.raise(throwErrorAt, "Error parsing regular expression: " + e.message)
      throw e
    }
  }
}

var regexpUnicodeSupport = !!tryCreateRegexp("\uffff", "u")

pp$7.readRegexp = function() {
  var this$1 = this;

  var escaped, inClass, start = this.pos
  for (;;) {
    if (this$1.pos >= this$1.input.length) this$1.raise(start, "Unterminated regular expression")
    var ch = this$1.input.charAt(this$1.pos)
    if (lineBreak.test(ch)) this$1.raise(start, "Unterminated regular expression")
    if (!escaped) {
      if (ch === "[") inClass = true
      else if (ch === "]" && inClass) inClass = false
      else if (ch === "/" && !inClass) break
      escaped = ch === "\\"
    } else escaped = false
    ++this$1.pos
  }
  var content = this.input.slice(start, this.pos)
  ++this.pos
  // Need to use `readWord1` because '\uXXXX' sequences are allowed
  // here (don't ask).
  var mods = this.readWord1()
  var tmp = content, tmpFlags = ""
  if (mods) {
    var validFlags = /^[gim]*$/
    if (this.options.ecmaVersion >= 6) validFlags = /^[gimuy]*$/
    if (!validFlags.test(mods)) this.raise(start, "Invalid regular expression flag")
    if (mods.indexOf("u") >= 0) {
      if (regexpUnicodeSupport) {
        tmpFlags = "u"
      } else {
        // Replace each astral symbol and every Unicode escape sequence that
        // possibly represents an astral symbol or a paired surrogate with a
        // single ASCII symbol to avoid throwing on regular expressions that
        // are only valid in combination with the `/u` flag.
        // Note: replacing with the ASCII symbol `x` might cause false
        // negatives in unlikely scenarios. For example, `[\u{61}-b]` is a
        // perfectly valid pattern that is equivalent to `[a-b]`, but it would
        // be replaced by `[x-b]` which throws an error.
        tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}/g, function (_match, code, offset) {
          code = Number("0x" + code)
          if (code > 0x10FFFF) this$1.raise(start + offset + 3, "Code point out of bounds")
          return "x"
        })
        tmp = tmp.replace(/\\u([a-fA-F0-9]{4})|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "x")
        tmpFlags = tmpFlags.replace("u", "")
      }
    }
  }
  // Detect invalid regular expressions.
  var value = null
  // Rhino's regular expression parser is flaky and throws uncatchable exceptions,
  // so don't do detection if we are running under Rhino
  if (!isRhino) {
    tryCreateRegexp(tmp, tmpFlags, start, this)
    // Get a regular expression object for this pattern-flag pair, or `null` in
    // case the current environment doesn't support the flags it uses.
    value = tryCreateRegexp(content, mods)
  }
  return this.finishToken(tt.regexp, {pattern: content, flags: mods, value: value})
}

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp$7.readInt = function(radix, len) {
  var this$1 = this;

  var start = this.pos, total = 0
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    var code = this$1.input.charCodeAt(this$1.pos), val
    if (code >= 97) val = code - 97 + 10 // a
    else if (code >= 65) val = code - 65 + 10 // A
    else if (code >= 48 && code <= 57) val = code - 48 // 0-9
    else val = Infinity
    if (val >= radix) break
    ++this$1.pos
    total = total * radix + val
  }
  if (this.pos === start || len != null && this.pos - start !== len) return null

  return total
}

pp$7.readRadixNumber = function(radix) {
  this.pos += 2 // 0x
  var val = this.readInt(radix)
  if (val == null) this.raise(this.start + 2, "Expected number in radix " + radix)
  if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number")
  return this.finishToken(tt.num, val)
}

// Read an integer, octal integer, or floating-point number.

pp$7.readNumber = function(startsWithDot) {
  var start = this.pos, isFloat = false, octal = this.input.charCodeAt(this.pos) === 48
  if (!startsWithDot && this.readInt(10) === null) this.raise(start, "Invalid number")
  var next = this.input.charCodeAt(this.pos)
  if (next === 46) { // '.'
    ++this.pos
    this.readInt(10)
    isFloat = true
    next = this.input.charCodeAt(this.pos)
  }
  if (next === 69 || next === 101) { // 'eE'
    next = this.input.charCodeAt(++this.pos)
    if (next === 43 || next === 45) ++this.pos // '+-'
    if (this.readInt(10) === null) this.raise(start, "Invalid number")
    isFloat = true
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) this.raise(this.pos, "Identifier directly after number")

  var str = this.input.slice(start, this.pos), val
  if (isFloat) val = parseFloat(str)
  else if (!octal || str.length === 1) val = parseInt(str, 10)
  else if (/[89]/.test(str) || this.strict) this.raise(start, "Invalid number")
  else val = parseInt(str, 8)
  return this.finishToken(tt.num, val)
}

// Read a string value, interpreting backslash-escapes.

pp$7.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code

  if (ch === 123) {
    if (this.options.ecmaVersion < 6) this.unexpected()
    var codePos = ++this.pos
    code = this.readHexChar(this.input.indexOf('}', this.pos) - this.pos)
    ++this.pos
    if (code > 0x10FFFF) this.raise(codePos, "Code point out of bounds")
  } else {
    code = this.readHexChar(4)
  }
  return code
}

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) return String.fromCharCode(code)
  code -= 0x10000
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
}

pp$7.readString = function(quote) {
  var this$1 = this;

  var out = "", chunkStart = ++this.pos
  for (;;) {
    if (this$1.pos >= this$1.input.length) this$1.raise(this$1.start, "Unterminated string constant")
    var ch = this$1.input.charCodeAt(this$1.pos)
    if (ch === quote) break
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos)
      out += this$1.readEscapedChar(false)
      chunkStart = this$1.pos
    } else {
      if (isNewLine(ch)) this$1.raise(this$1.start, "Unterminated string constant")
      ++this$1.pos
    }
  }
  out += this.input.slice(chunkStart, this.pos++)
  return this.finishToken(tt.string, out)
}

// Reads template string tokens.

pp$7.readTmplToken = function() {
  var this$1 = this;

  var out = "", chunkStart = this.pos
  for (;;) {
    if (this$1.pos >= this$1.input.length) this$1.raise(this$1.start, "Unterminated template")
    var ch = this$1.input.charCodeAt(this$1.pos)
    if (ch === 96 || ch === 36 && this$1.input.charCodeAt(this$1.pos + 1) === 123) { // '`', '${'
      if (this$1.pos === this$1.start && this$1.type === tt.template) {
        if (ch === 36) {
          this$1.pos += 2
          return this$1.finishToken(tt.dollarBraceL)
        } else {
          ++this$1.pos
          return this$1.finishToken(tt.backQuote)
        }
      }
      out += this$1.input.slice(chunkStart, this$1.pos)
      return this$1.finishToken(tt.template, out)
    }
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos)
      out += this$1.readEscapedChar(true)
      chunkStart = this$1.pos
    } else if (isNewLine(ch)) {
      out += this$1.input.slice(chunkStart, this$1.pos)
      ++this$1.pos
      switch (ch) {
        case 13:
          if (this$1.input.charCodeAt(this$1.pos) === 10) ++this$1.pos
        case 10:
          out += "\n"
          break
        default:
          out += String.fromCharCode(ch)
          break
      }
      if (this$1.options.locations) {
        ++this$1.curLine
        this$1.lineStart = this$1.pos
      }
      chunkStart = this$1.pos
    } else {
      ++this$1.pos
    }
  }
}

// Used to read escaped characters

pp$7.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos)
  ++this.pos
  switch (ch) {
  case 110: return "\n" // 'n' -> '\n'
  case 114: return "\r" // 'r' -> '\r'
  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  case 117: return codePointToString(this.readCodePoint()) // 'u'
  case 116: return "\t" // 't' -> '\t'
  case 98: return "\b" // 'b' -> '\b'
  case 118: return "\u000b" // 'v' -> '\u000b'
  case 102: return "\f" // 'f' -> '\f'
  case 13: if (this.input.charCodeAt(this.pos) === 10) ++this.pos // '\r\n'
  case 10: // ' \n'
    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine }
    return ""
  default:
    if (ch >= 48 && ch <= 55) {
      var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0]
      var octal = parseInt(octalStr, 8)
      if (octal > 255) {
        octalStr = octalStr.slice(0, -1)
        octal = parseInt(octalStr, 8)
      }
      if (octalStr !== "0" && (this.strict || inTemplate)) {
        this.raise(this.pos - 2, "Octal literal in strict mode")
      }
      this.pos += octalStr.length - 1
      return String.fromCharCode(octal)
    }
    return String.fromCharCode(ch)
  }
}

// Used to read character escape sequences ('\x', '\u', '\U').

pp$7.readHexChar = function(len) {
  var codePos = this.pos
  var n = this.readInt(16, len)
  if (n === null) this.raise(codePos, "Bad character escape sequence")
  return n
}

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp$7.readWord1 = function() {
  var this$1 = this;

  this.containsEsc = false
  var word = "", first = true, chunkStart = this.pos
  var astral = this.options.ecmaVersion >= 6
  while (this.pos < this.input.length) {
    var ch = this$1.fullCharCodeAtPos()
    if (isIdentifierChar(ch, astral)) {
      this$1.pos += ch <= 0xffff ? 1 : 2
    } else if (ch === 92) { // "\"
      this$1.containsEsc = true
      word += this$1.input.slice(chunkStart, this$1.pos)
      var escStart = this$1.pos
      if (this$1.input.charCodeAt(++this$1.pos) != 117) // "u"
        this$1.raise(this$1.pos, "Expecting Unicode escape sequence \\uXXXX")
      ++this$1.pos
      var esc = this$1.readCodePoint()
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
        this$1.raise(escStart, "Invalid Unicode escape")
      word += codePointToString(esc)
      chunkStart = this$1.pos
    } else {
      break
    }
    first = false
  }
  return word + this.input.slice(chunkStart, this.pos)
}

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp$7.readWord = function() {
  var word = this.readWord1()
  var type = tt.name
  if ((this.options.ecmaVersion >= 6 || !this.containsEsc) && this.keywords.test(word))
    type = keywordTypes[word]
  return this.finishToken(type, word)
}

// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/ternjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/ternjs/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

function parse(input, options) {
  return new Parser(options, input).parse()
}

function walk ( ast, ref) {
	var enter = ref.enter;
	var leave = ref.leave;

	visit( ast, null, enter, leave );
}

var context = {
	skip: function () { return context.shouldSkip = true; },
	shouldSkip: false
};

var childKeys = {};

var toString$1 = Object.prototype.toString;

function isArray$1 ( thing ) {
	return toString$1.call( thing ) === '[object Array]';
}

function visit ( node, parent, enter, leave, prop, index ) {
	if ( !node ) return;

	if ( enter ) {
		context.shouldSkip = false;
		enter.call( context, node, parent, prop, index );
		if ( context.shouldSkip ) return;
	}

	var keys = childKeys[ node.type ] || (
		childKeys[ node.type ] = Object.keys( node ).filter( function ( key ) { return typeof node[ key ] === 'object'; } )
	);

	var key, value, i, j;

	i = keys.length;
	while ( i-- ) {
		key = keys[i];
		value = node[ key ];

		if ( isArray$1( value ) ) {
			j = value.length;
			while ( j-- ) {
				visit( value[j], node, enter, leave, key, j );
			}
		}

		else if ( value && value.type ) {
			visit( value, node, enter, leave, key, null );
		}
	}

	if ( leave ) {
		leave( node, parent, prop, index );
	}
}

var reservedWords$1 = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public'.split( ' ' );
var builtins = 'Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl'.split( ' ' );

var blacklisted = blank();
reservedWords$1.concat( builtins ).forEach( function (word) { return blacklisted[ word ] = true; } );


function makeLegalIdentifier ( str ) {
	str = str
		.replace( /-(\w)/g, function ( _, letter ) { return letter.toUpperCase(); } )
		.replace( /[^$_a-zA-Z0-9]/g, '_' );

	if ( /\d/.test( str[0] ) || blacklisted[ str ] ) str = "_" + str;

	return str;
}

var modifierNodes = {
	AssignmentExpression: 'left',
	UpdateExpression: 'argument',
	UnaryExpression: 'argument'
};

function isModifierNode ( node ) {
	if ( !( node.type in modifierNodes ) ) {
		return false;
	}

	if ( node.type === 'UnaryExpression' ) {
		return node.operator === 'delete';
	}

	return true;
}

function isReference ( node, parent ) {
	if ( node.type === 'MemberExpression' ) {
		return !node.computed && isReference( node.object, node );
	}

	if ( node.type === 'Identifier' ) {
		// the only time we could have an identifier node without a parent is
		// if it's the entire body of a function without a block statement –
		// i.e. an arrow function expression like `a => a`
		if ( !parent ) return true;

		// TODO is this right?
		if ( parent.type === 'MemberExpression' || parent.type === 'MethodDefinition' ) {
			return parent.computed || node === parent.object;
		}

		// disregard the `bar` in `{ bar: foo }`, but keep it in `{ [bar]: foo }`
		if ( parent.type === 'Property' ) return parent.computed || node === parent.value;

		// disregard the `bar` in `class Foo { bar () {...} }`
		if ( parent.type === 'MethodDefinition' ) return false;

		// disregard the `bar` in `export { foo as bar }`
		if ( parent.type === 'ExportSpecifier' && node !== parent.local ) return;

		return true;
	}
}

function flatten ( node ) {
	var parts = [];
	while ( node.type === 'MemberExpression' ) {
		if ( node.computed ) return null;
		parts.unshift( node.property.name );

		node = node.object;
	}

	if ( node.type !== 'Identifier' ) return null;

	var name = node.name;
	parts.unshift( name );

	return { name: name, keypath: parts.join( '.' ) };
}

var pureFunctions = {};

var arrayTypes = 'Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array'.split( ' ' );
var simdTypes = 'Int8x16 Int16x8 Int32x4 Float32x4 Float64x2'.split( ' ' );
var simdMethods = 'abs add and bool check div equal extractLane fromFloat32x4 fromFloat32x4Bits fromFloat64x2 fromFloat64x2Bits fromInt16x8Bits fromInt32x4 fromInt32x4Bits fromInt8x16Bits greaterThan greaterThanOrEqual lessThan lessThanOrEqual load max maxNum min minNum mul neg not notEqual or reciprocalApproximation reciprocalSqrtApproximation replaceLane select selectBits shiftLeftByScalar shiftRightArithmeticByScalar shiftRightLogicalByScalar shuffle splat sqrt store sub swizzle xor'.split( ' ' );
var allSimdMethods = [];
simdTypes.forEach( function (t) {
	simdMethods.forEach( function (m) {
		allSimdMethods.push( ("SIMD." + t + "." + m) );
	});
});

[
	'Array.isArray',
	'Error', 'EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
	'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape', 'unescape',
	'Object', 'Object.create', 'Object.getNotifier', 'Object.getOwn', 'Object.getOwnPropertyDescriptor', 'Object.getOwnPropertyNames', 'Object.getOwnPropertySymbols', 'Object.getPrototypeOf', 'Object.is', 'Object.isExtensible', 'Object.isFrozen', 'Object.isSealed', 'Object.keys',
	'Function', 'Boolean',
	'Number', 'Number.isFinite', 'Number.isInteger', 'Number.isNaN', 'Number.isSafeInteger', 'Number.parseFloat', 'Number.parseInt',
	'Symbol', 'Symbol.for', 'Symbol.keyFor',
	'Math.abs', 'Math.acos', 'Math.acosh', 'Math.asin', 'Math.asinh', 'Math.atan', 'Math.atan2', 'Math.atanh', 'Math.cbrt', 'Math.ceil', 'Math.clz32', 'Math.cos', 'Math.cosh', 'Math.exp', 'Math.expm1', 'Math.floor', 'Math.fround', 'Math.hypot', 'Math.imul', 'Math.log', 'Math.log10', 'Math.log1p', 'Math.log2', 'Math.max', 'Math.min', 'Math.pow', 'Math.random', 'Math.round', 'Math.sign', 'Math.sin', 'Math.sinh', 'Math.sqrt', 'Math.tan', 'Math.tanh', 'Math.trunc',
	'Date', 'Date.UTC', 'Date.now', 'Date.parse',
	'String', 'String.fromCharCode', 'String.fromCodePoint', 'String.raw',
	'RegExp',
	'Map', 'Set', 'WeakMap', 'WeakSet',
	'ArrayBuffer', 'ArrayBuffer.isView',
	'DataView',
	'JSON.parse', 'JSON.stringify',
	'Promise', 'Promise.all', 'Promise.race', 'Promise.reject', 'Promise.resolve',
	'Intl.Collator', 'Intl.Collator.supportedLocalesOf', 'Intl.DateTimeFormat', 'Intl.DateTimeFormat.supportedLocalesOf', 'Intl.NumberFormat', 'Intl.NumberFormat.supportedLocalesOf'

	// TODO properties of e.g. window...
].concat(
	arrayTypes,
	arrayTypes.map( function (t) { return (t + ".from"); } ),
	arrayTypes.map( function (t) { return (t + ".of"); } ),
	simdTypes.map( function (t) { return ("SIMD." + t); } ),
	allSimdMethods
).forEach( function (name) { return pureFunctions[ name ] = true; } );

function getLocation ( source, charIndex ) {
	var lines = source.split( '\n' );
	var len = lines.length;

	var lineStart = 0;
	var i;

	for ( i = 0; i < len; i += 1 ) {
		var line = lines[i];
		var lineEnd =  lineStart + line.length + 1; // +1 for newline

		if ( lineEnd > charIndex ) {
			return { line: i + 1, column: charIndex - lineStart };
		}

		lineStart = lineEnd;
	}

	throw new Error( 'Could not determine location of character' );
}

function error ( props ) {
	var err = new Error( props.message );

	Object.keys( props ).forEach( function (key) {
		err[ key ] = props[ key ];
	});

	throw err;
}

function call ( callee, scope, statement, strongDependencies ) {
	while ( callee.type === 'ParenthesizedExpression' ) callee = callee.expression;

	if ( callee.type === 'Identifier' ) {
		var declaration = scope.findDeclaration( callee.name ) ||
							statement.module.trace( callee.name );

		if ( declaration ) {
			if ( declaration.isNamespace ) {
				error({
					message: ("Cannot call a namespace ('" + (callee.name) + "')"),
					file: statement.module.id,
					pos: callee.start,
					loc: getLocation( statement.module.code, callee.start )
				});
			}

			return declaration.run( strongDependencies );
		}

		return !pureFunctions[ callee.name ];
	}

	if ( /FunctionExpression/.test( callee.type ) ) {
		return run( callee.body, scope, statement, strongDependencies );
	}

	if ( callee.type === 'MemberExpression' ) {
		var flattened = flatten( callee );

		if ( flattened ) {
			// if we're calling e.g. Object.keys(thing), there are no side-effects
			// TODO make pureFunctions configurable
			var declaration$1 = scope.findDeclaration( flattened.name ) || statement.module.trace( flattened.name );

			return ( !!declaration$1 || !pureFunctions[ flattened.keypath ] );
		}
	}

	// complex case like `( a ? b : c )()` or foo[bar].baz()`
	// – err on the side of caution
	return true;
}

function run ( node, scope, statement, strongDependencies, force ) {
	var hasSideEffect = false;

	walk( node, {
		enter: function enter ( node, parent ) {
			if ( !force && /Function/.test( node.type ) ) return this.skip();

			if ( node._scope ) scope = node._scope;

			if ( isReference( node, parent ) ) {
				var flattened = flatten( node );

				if ( flattened.name === 'arguments' ) {
					hasSideEffect = true;
				}

				else if ( !scope.contains( flattened.name ) ) {
					var declaration = statement.module.trace( flattened.name );
					if ( declaration && !declaration.isExternal ) {
						var module = declaration.module || declaration.statement.module; // TODO is this right?
						if ( !module.isExternal && !~strongDependencies.indexOf( module ) ) strongDependencies.push( module );
					}
				}
			}

			else if ( node.type === 'DebuggerStatement' ) {
				hasSideEffect = true;
			}

			else if ( node.type === 'ThrowStatement' ) {
				// we only care about errors thrown at the top level, otherwise
				// any function with error checking gets included if called
				if ( scope.isTopLevel ) hasSideEffect = true;
			}

			else if ( node.type === 'CallExpression' || node.type === 'NewExpression' ) {
				if ( call( node.callee, scope, statement, strongDependencies ) ) {
					hasSideEffect = true;
				}
			}

			else if ( isModifierNode( node ) ) {
				var subject = node[ modifierNodes[ node.type ] ];
				while ( subject.type === 'MemberExpression' ) subject = subject.object;

				var declaration$1 = scope.findDeclaration( subject.name );

				if ( declaration$1 ) {
					if ( declaration$1.isParam ) hasSideEffect = true;
				} else if ( !scope.isTopLevel ) {
					hasSideEffect = true;
				} else {
					declaration$1 = statement.module.trace( subject.name );

					if ( !declaration$1 || declaration$1.isExternal || declaration$1.isUsed || ( declaration$1.original && declaration$1.original.isUsed ) ) {
						hasSideEffect = true;
					}
				}
			}
		},
		leave: function leave ( node ) {
			if ( node._scope ) scope = scope.parent;
		}
	});

	return hasSideEffect;
}

var Reference = function Reference ( node, scope, statement ) {
	var this$1 = this;

	this.node = node;
	this.scope = scope;
	this.statement = statement;

	this.declaration = null; // bound later

	this.parts = [];

	var root = node;
	while ( root.type === 'MemberExpression' ) {
		this$1.parts.unshift( root.property );
		root = root.object;
	}

	this.name = root.name;

	this.start = node.start;
	this.end = node.start + this.name.length; // can be overridden in the case of namespace members
	this.rewritten = false;
};

var SyntheticReference = function SyntheticReference ( name ) {
	this.name = name;
	this.parts = [];
};

var use = function (alias) { return alias.use(); };

var Declaration = function Declaration ( node, isParam, statement ) {
	if ( node ) {
		if ( node.type === 'FunctionDeclaration' ) {
			this.isFunctionDeclaration = true;
			this.functionNode = node;
		} else if ( node.type === 'VariableDeclarator' && node.init && /FunctionExpression/.test( node.init.type ) ) {
			this.isFunctionDeclaration = true;
			this.functionNode = node.init;
		}
	}

	this.statement = statement;
	this.name = node.id ? node.id.name : node.name;
	this.exportName = null;
	this.isParam = isParam;

	this.isReassigned = false;
	this.aliases = [];

	this.isUsed = false;
};

Declaration.prototype.addAlias = function addAlias ( declaration ) {
	this.aliases.push( declaration );
};

Declaration.prototype.addReference = function addReference ( reference ) {
	reference.declaration = this;

	if ( reference.name !== this.name ) {
		this.name = makeLegalIdentifier( reference.name ); // TODO handle differences of opinion
	}

	if ( reference.isReassignment ) this.isReassigned = true;
};

Declaration.prototype.render = function render ( es ) {
	if ( es ) return this.name;
	if ( !this.isReassigned || !this.exportName ) return this.name;

	return ("exports." + (this.exportName));
};

Declaration.prototype.run = function run$1 ( strongDependencies ) {
	if ( this.tested ) return this.hasSideEffects;


	if ( !this.functionNode ) {
		this.hasSideEffects = true; // err on the side of caution. TODO handle unambiguous `var x; x = y => z` cases
	} else {
		if ( this.running ) return true; // short-circuit infinite loop
		this.running = true;

		this.hasSideEffects = run( this.functionNode.body, this.functionNode._scope, this.statement, strongDependencies, false );

		this.running = false;
	}

	this.tested = true;
	return this.hasSideEffects;
};

Declaration.prototype.use = function use$1 () {
	if ( this.isUsed ) return;

	this.isUsed = true;
	if ( this.statement ) this.statement.mark();

	this.aliases.forEach( use );
};

var SyntheticDefaultDeclaration = function SyntheticDefaultDeclaration ( node, statement, name ) {
	this.node = node;
	this.statement = statement;
	this.name = name;

	this.original = null;
	this.exportName = null;
	this.aliases = [];
};

SyntheticDefaultDeclaration.prototype.addAlias = function addAlias ( declaration ) {
	this.aliases.push( declaration );
};

SyntheticDefaultDeclaration.prototype.addReference = function addReference ( reference ) {
	// Bind the reference to `this` declaration.
	reference.declaration = this;

	// Don't change the name to `default`; it's not a valid identifier name.
	if ( reference.name === 'default' ) return;

	this.name = reference.name;
};

SyntheticDefaultDeclaration.prototype.bind = function bind ( declaration ) {
	this.original = declaration;
};

SyntheticDefaultDeclaration.prototype.render = function render () {
	return !this.original || this.original.isReassigned ?
		this.name :
		this.original.render();
};

SyntheticDefaultDeclaration.prototype.run = function run$2 ( strongDependencies ) {
	if ( this.original ) {
		return this.original.run( strongDependencies );
	}

	var declaration = this.node.declaration;
	while ( declaration.type === 'ParenthesizedExpression' ) declaration = declaration.expression;

	if ( /FunctionExpression/.test( declaration.type ) ) {
		return run( declaration.body, this.statement.scope, this.statement, strongDependencies, false );
	}

	// otherwise assume the worst
	return true;
};

SyntheticDefaultDeclaration.prototype.use = function use$2 () {
	this.isUsed = true;
	this.statement.mark();

	if ( this.original ) this.original.use();

	this.aliases.forEach( use );
};

var SyntheticGlobalDeclaration = function SyntheticGlobalDeclaration ( name ) {
	this.name = name;
	this.isExternal = true;
	this.isGlobal = true;
	this.isReassigned = false;

	this.aliases = [];

	this.isUsed = false;
};

SyntheticGlobalDeclaration.prototype.addAlias = function addAlias ( declaration ) {
	this.aliases.push( declaration );
};

SyntheticGlobalDeclaration.prototype.addReference = function addReference ( reference ) {
	reference.declaration = this;
	if ( reference.isReassignment ) this.isReassigned = true;
};

SyntheticGlobalDeclaration.prototype.render = function render () {
	return this.name;
};

SyntheticGlobalDeclaration.prototype.run = function run$3 () {
	return true;
};

SyntheticGlobalDeclaration.prototype.use = function use$3 () {
	if ( this.isUsed ) return;
	this.isUsed = true;

	this.aliases.forEach( use );
};

var SyntheticNamespaceDeclaration = function SyntheticNamespaceDeclaration ( module ) {
	var this$1 = this;

	this.isNamespace = true;
	this.module = module;
	this.name = null;

	this.needsNamespaceBlock = false;
	this.aliases = [];

	this.originals = blank();
	module.getExports().forEach( function (name) {
		this$1.originals[ name ] = module.traceExport( name );
	});
};

SyntheticNamespaceDeclaration.prototype.addAlias = function addAlias ( declaration ) {
	this.aliases.push( declaration );
};

SyntheticNamespaceDeclaration.prototype.addReference = function addReference ( reference ) {
	// if we have e.g. `foo.bar`, we can optimise
	// the reference by pointing directly to `bar`
	if ( reference.parts.length ) {
		var ref = reference.parts.shift();
		reference.name = ref.name;
		reference.end = ref.end;

		var original = this.originals[ reference.name ];

		// throw with an informative error message if the reference doesn't exist.
		if ( !original ) {
			this.module.bundle.onwarn( ("Export '" + (reference.name) + "' is not defined by '" + (this.module.id) + "'") );
			reference.isUndefined = true;
			return;
		}

		original.addReference( reference );
		return;
	}

	// otherwise we're accessing the namespace directly,
	// which means we need to mark all of this module's
	// exports and render a namespace block in the bundle
	if ( !this.needsNamespaceBlock ) {
		this.needsNamespaceBlock = true;
		this.module.bundle.internalNamespaces.push( this );

		// add synthetic references, in case of chained
		// namespace imports
		forOwn( this.originals, function ( original, name ) {
			original.addReference( new SyntheticReference( name ) );
		});
	}

	reference.declaration = this;
	this.name = reference.name;
};

SyntheticNamespaceDeclaration.prototype.renderBlock = function renderBlock ( indentString ) {
		var this$1 = this;

	var members = keys( this.originals ).map( function (name) {
		var original = this$1.originals[ name ];

		if ( original.isReassigned ) {
			return (indentString + "get " + name + " () { return " + (original.render()) + "; }");
		}

		return ("" + indentString + name + ": " + (original.render()));
	});

	return ((this.module.bundle.varOrConst) + " " + (this.render()) + " = Object.freeze({\n" + (members.join( ',\n' )) + "\n});\n\n");
};

SyntheticNamespaceDeclaration.prototype.render = function render () {
	return this.name;
};

SyntheticNamespaceDeclaration.prototype.use = function use$4 () {
	forOwn( this.originals, use );
	this.aliases.forEach( use );
};

var ExternalDeclaration = function ExternalDeclaration ( module, name ) {
	this.module = module;
	this.name = name;
	this.safeName = null;
	this.isExternal = true;

	this.isNamespace = name === '*';
};

ExternalDeclaration.prototype.addAlias = function addAlias () {
	// noop
};

ExternalDeclaration.prototype.addReference = function addReference ( reference ) {
	reference.declaration = this;

	if ( this.name === 'default' || this.name === '*' ) {
		this.module.suggestName( reference.name );
	}
};

ExternalDeclaration.prototype.render = function render ( es ) {
	if ( this.name === '*' ) {
		return this.module.name;
	}

	if ( this.name === 'default' ) {
		return this.module.exportsNamespace || ( !es && this.module.exportsNames ) ?
			((this.module.name) + "__default") :
			this.module.name;
	}

	return es ? this.safeName : ((this.module.name) + "." + (this.name));
};

ExternalDeclaration.prototype.run = function run$4 () {
	return true;
};

ExternalDeclaration.prototype.setSafeName = function setSafeName ( name ) {
	this.safeName = name;
};

ExternalDeclaration.prototype.use = function use$5 () {
	// noop?
};

function extractNames ( param ) {
	var names = [];
	extractors[ param.type ]( names, param );
	return names;
}

var extractors = {
	Identifier: function Identifier ( names, param ) {
		names.push( param.name );
	},

	ObjectPattern: function ObjectPattern ( names, param ) {
		param.properties.forEach( function (prop) {
			extractors[ prop.value.type ]( names, prop.value );
		});
	},

	ArrayPattern: function ArrayPattern ( names, param ) {
		param.elements.forEach( function (element) {
			if ( element ) extractors[ element.type ]( names, element );
		});
	},

	RestElement: function RestElement ( names, param ) {
		extractors[ param.argument.type ]( names, param.argument );
	},

	AssignmentPattern: function AssignmentPattern ( names, param ) {
		extractors[ param.left.type ]( names, param.left );
	}
};

var Scope = function Scope ( options ) {
	var this$1 = this;

	options = options || {};

	this.parent = options.parent;
	this.statement = options.statement || this.parent.statement;
	this.isBlockScope = !!options.block;
	this.isTopLevel = !this.parent || ( this.parent.isTopLevel && this.isBlockScope );

	this.declarations = blank();

	if ( options.params ) {
		options.params.forEach( function (param) {
			extractNames( param ).forEach( function (name) {
				this$1.declarations[ name ] = new Declaration( param, true, this$1.statement );
			});
		});
	}
};

Scope.prototype.addDeclaration = function addDeclaration ( node, isBlockDeclaration, isVar ) {
		var this$1 = this;

	if ( !isBlockDeclaration && this.isBlockScope ) {
		// it's a `var` or function node, and this
		// is a block scope, so we need to go up
		this.parent.addDeclaration( node, isBlockDeclaration, isVar );
	} else {
		extractNames( node.id ).forEach( function (name) {
			this$1.declarations[ name ] = new Declaration( node, false, this$1.statement );
		});
	}
};

Scope.prototype.contains = function contains ( name ) {
	return this.declarations[ name ] ||
		       ( this.parent ? this.parent.contains( name ) : false );
};

Scope.prototype.eachDeclaration = function eachDeclaration ( fn ) {
		var this$1 = this;

	keys( this.declarations ).forEach( function (key) {
		fn( key, this$1.declarations[ key ] );
	});
};

Scope.prototype.findDeclaration = function findDeclaration ( name ) {
	return this.declarations[ name ] ||
		       ( this.parent && this.parent.findDeclaration( name ) );
};

var blockDeclarations = {
	const: true,
	let: true
};

function attachScopes ( statement ) {
	var node = statement.node;
	var scope = statement.scope;

	walk( node, {
		enter: function enter ( node, parent ) {
			// function foo () {...}
			// class Foo {...}
			if ( /(Function|Class)Declaration/.test( node.type ) ) {
				scope.addDeclaration( node, false, false );
			}

			// var foo = 1, bar = 2
			if ( node.type === 'VariableDeclaration' ) {
				var isBlockDeclaration = blockDeclarations[ node.kind ];

				node.declarations.forEach( function (declarator) {
					scope.addDeclaration( declarator, isBlockDeclaration, true );
				});
			}

			var newScope;

			// create new function scope
			if ( /(Function|Class)/.test( node.type ) ) {
				newScope = new Scope({
					parent: scope,
					block: false,
					params: node.params
				});

				// named function expressions - the name is considered
				// part of the function's scope
				if ( /(Function|Class)Expression/.test( node.type ) && node.id ) {
					newScope.addDeclaration( node, false, false );
				}
			}

			// create new block scope
			if ( node.type === 'BlockStatement' && ( !parent || !/Function/.test( parent.type ) ) ) {
				newScope = new Scope({
					parent: scope,
					block: true
				});
			}

			// catch clause has its own block scope
			if ( node.type === 'CatchClause' ) {
				newScope = new Scope({
					parent: scope,
					params: [ node.param ],
					block: true
				});
			}

			if ( newScope ) {
				Object.defineProperty( node, '_scope', {
					value: newScope,
					configurable: true
				});

				scope = newScope;
			}
		},
		leave: function leave ( node ) {
			if ( node._scope ) {
				scope = scope.parent;
			}
		}
	});
}

function isFunctionDeclaration ( node ) {
	if ( !node ) return false;

	return node.type === 'FunctionDeclaration' ||
		( node.type === 'VariableDeclaration' && node.init && /FunctionExpression/.test( node.init.type ) );
}

var Statement = function Statement ( node, module, start, end ) {
	this.node = node;
	this.module = module;
	this.start = start;
	this.end = end;
	this.next = null; // filled in later

	this.scope = new Scope({ statement: this });

	this.references = [];
	this.stringLiteralRanges = [];

	this.isIncluded = false;
	this.ran = false;

	this.isImportDeclaration = node.type === 'ImportDeclaration';
	this.isExportDeclaration = /^Export/.test( node.type );
	this.isReexportDeclaration = this.isExportDeclaration && !!node.source;

	this.isFunctionDeclaration = isFunctionDeclaration( node ) ||
		this.isExportDeclaration && isFunctionDeclaration( node.declaration );
};

Statement.prototype.firstPass = function firstPass () {
	if ( this.isImportDeclaration ) return; // nothing to analyse

	// attach scopes
	attachScopes( this );

	// find references
	var statement = this;
	var ref = this;
		var module = ref.module;
		var references = ref.references;
		var scope = ref.scope;
		var stringLiteralRanges = ref.stringLiteralRanges;
	var contextDepth = 0;

	walk( this.node, {
		enter: function enter ( node, parent, prop ) {
			// warn about eval
			if ( node.type === 'CallExpression' && node.callee.name === 'eval' && !scope.contains( 'eval' ) ) {
				// TODO show location
				module.bundle.onwarn( ("Use of `eval` (in " + (module.id) + ") is strongly discouraged, as it poses security risks and may cause issues with minification. See https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval for more details") );
			}

			// skip re-export declarations
			if ( node.type === 'ExportNamedDeclaration' && node.source ) return this.skip();

			if ( node.type === 'TemplateElement' ) stringLiteralRanges.push([ node.start, node.end ]);
			if ( node.type === 'Literal' && typeof node.value === 'string' && /\n/.test( node.raw ) ) {
				stringLiteralRanges.push([ node.start + 1, node.end - 1 ]);
			}

			if ( node.type === 'ThisExpression' && contextDepth === 0 ) {
				module.magicString.overwrite( node.start, node.end, module.bundle.context );
				if ( module.bundle.context === 'undefined' ) module.bundle.onwarn( 'The `this` keyword is equivalent to `undefined` at the top level of an ES module, and has been rewritten' );
			}

			if ( node._scope ) scope = node._scope;
			if ( /^Function/.test( node.type ) ) contextDepth += 1;

			var isReassignment;

			if ( parent && isModifierNode( parent ) ) {
				var subject = parent[ modifierNodes[ parent.type ] ];

				if ( node === subject ) {
					var depth = 0;

					while ( subject.type === 'MemberExpression' ) {
						subject = subject.object;
						depth += 1;
					}

					var importDeclaration = module.imports[ subject.name ];

					if ( !scope.contains( subject.name ) && importDeclaration ) {
						var minDepth = importDeclaration.name === '*' ?
							2 : // cannot do e.g. `namespace.foo = bar`
							1;  // cannot do e.g. `foo = bar`, but `foo.bar = bar` is fine

						if ( depth < minDepth ) {
							var err = new Error( ("Illegal reassignment to import '" + (subject.name) + "'") );
							err.file = module.id;
							err.loc = getLocation( module.magicString.original, subject.start );
							throw err;
						}
					}

					isReassignment = !depth;
				}
			}

			if ( isReference( node, parent ) ) {
				// function declaration IDs are a special case – they're associated
				// with the parent scope
					var referenceScope = parent.type === 'FunctionDeclaration' && node === parent.id ?
						scope.parent :
						scope;

					var isShorthandProperty = parent.type === 'Property' && parent.shorthand;

					// Since `node.key` can equal `node.value` for shorthand properties
				// we must use the `prop` argument provided by `estree-walker` to determine
				// if we're looking at the key or the value.
				// If they are equal, we'll return to not create duplicate references.
				if ( isShorthandProperty && parent.value === parent.key && prop === 'value' ) {
					return;
				}

				var reference = new Reference( node, referenceScope, statement );
				reference.isReassignment = isReassignment;
				reference.isShorthandProperty = isShorthandProperty;
				references.push( reference );

				this.skip(); // don't descend from `foo.bar.baz` into `foo.bar`
			}
		},
		leave: function leave ( node ) {
			if ( node._scope ) scope = scope.parent;
			if ( /^Function/.test( node.type ) ) contextDepth -= 1;
		}
	});
};

Statement.prototype.mark = function mark () {
	if ( this.isIncluded ) return; // prevent infinite loops
	this.isIncluded = true;

	this.references.forEach( function (reference) {
		if ( reference.declaration ) reference.declaration.use();
	});
};

Statement.prototype.run = function run$1 ( strongDependencies ) {
	if ( ( this.ran && this.isIncluded ) || this.isImportDeclaration || this.isFunctionDeclaration ) return;
	this.ran = true;

	if ( run( this.node, this.scope, this, strongDependencies, false ) ) {
		this.mark();
		return true;
	}
};

Statement.prototype.source = function source () {
	return this.module.source.slice( this.start, this.end );
};

Statement.prototype.toString = function toString () {
	return this.module.magicString.slice( this.start, this.end );
};

function isTruthy ( node ) {
	if ( node.type === 'Literal' ) return !!node.value;
	if ( node.type === 'ParenthesizedExpression' ) return isTruthy( node.expression );
	if ( node.operator in operators ) return operators[ node.operator ]( node );
}

function isFalsy ( node ) {
	return not( isTruthy( node ) );
}

function not ( value ) {
	return value === undefined ? value : !value;
}

function equals ( a, b, strict ) {
	if ( a.type !== b.type ) return undefined;
	if ( a.type === 'Literal' ) return strict ? a.value === b.value : a.value == b.value;
}

var operators = {
	'==': function (x) {
		return equals( x.left, x.right, false );
	},

	'!=': function (x) { return not( operators['==']( x ) ); },

	'===': function (x) {
		return equals( x.left, x.right, true );
	},

	'!==': function (x) { return not( operators['===']( x ) ); },

	'!': function (x) { return isFalsy( x.argument ); },

	'&&': function (x) { return isTruthy( x.left ) && isTruthy( x.right ); },

	'||': function (x) { return isTruthy( x.left ) || isTruthy( x.right ); }
};

function emptyBlockStatement ( start, end ) {
	return {
		start: start, end: end,
		type: 'BlockStatement',
		body: []
	};
}

var Module = function Module (ref) {
	var this$1 = this;
	var id = ref.id;
	var code = ref.code;
	var originalCode = ref.originalCode;
	var originalSourceMap = ref.originalSourceMap;
	var ast = ref.ast;
	var sourceMapChain = ref.sourceMapChain;
	var resolvedIds = ref.resolvedIds;
	var bundle = ref.bundle;

	this.code = code;
	this.originalCode = originalCode;
	this.originalSourceMap = originalSourceMap;
	this.sourceMapChain = sourceMapChain;

	this.bundle = bundle;
	this.id = id;
	this.excludeFromSourcemap = /\0/.test( id );

	// all dependencies
	this.sources = [];
	this.dependencies = [];
	this.resolvedIds = resolvedIds || blank();

	// imports and exports, indexed by local name
	this.imports = blank();
	this.exports = blank();
	this.exportsAll = blank();
	this.reexports = blank();

	this.exportAllSources = [];
	this.exportAllModules = null;

	// By default, `id` is the filename. Custom resolvers and loaders
	// can change that, but it makes sense to use it for the source filename
	this.magicString = new MagicString( code, {
		filename: this.excludeFromSourcemap ? null : id, // don't include plugin helpers in sourcemap
		indentExclusionRanges: []
	});

	// remove existing sourceMappingURL comments
	var pattern = new RegExp( ("\\/\\/#\\s+" + SOURCEMAPPING_URL$1 + "=.+\\n?"), 'g' );
	var match;
	while ( match = pattern.exec( code ) ) {
		this$1.magicString.remove( match.index, match.index + match[0].length );
	}

	this.comments = [];
	this.ast = ast;
	this.statements = this.parse();

	this.declarations = blank();
	this.analyse();

	this.strongDependencies = [];
};

Module.prototype.addExport = function addExport ( statement ) {
		var this$1 = this;

	var node = statement.node;
	var source = node.source && node.source.value;

	// export { name } from './other.js'
	if ( source ) {
		if ( !~this.sources.indexOf( source ) ) this.sources.push( source );

		if ( node.type === 'ExportAllDeclaration' ) {
			// Store `export * from '...'` statements in an array of delegates.
			// When an unknown import is encountered, we see if one of them can satisfy it.
			this.exportAllSources.push( source );
		}

		else {
			node.specifiers.forEach( function (specifier) {
				var name = specifier.exported.name;

				if ( this$1.exports[ name ] || this$1.reexports[ name ] ) {
					throw new Error( ("A module cannot have multiple exports with the same name ('" + name + "')") );
				}

				this$1.reexports[ name ] = {
					start: specifier.start,
					source: source,
					localName: specifier.local.name,
					module: null // filled in later
				};
			});
		}
	}

	// export default function foo () {}
	// export default foo;
	// export default 42;
	else if ( node.type === 'ExportDefaultDeclaration' ) {
		var identifier = ( node.declaration.id && node.declaration.id.name ) || node.declaration.name;

		if ( this.exports.default ) {
			// TODO indicate location
			throw new Error( 'A module can only have one default export' );
		}

		this.exports.default = {
			localName: 'default',
			identifier: identifier
		};

		// create a synthetic declaration
		this.declarations.default = new SyntheticDefaultDeclaration( node, statement, identifier || this.basename() );
	}

	// export var { foo, bar } = ...
	// export var foo = 42;
	// export var a = 1, b = 2, c = 3;
	// export function foo () {}
	else if ( node.declaration ) {
		var declaration = node.declaration;

		if ( declaration.type === 'VariableDeclaration' ) {
			declaration.declarations.forEach( function (decl) {
				extractNames( decl.id ).forEach( function (localName) {
					this$1.exports[ localName ] = { localName: localName };
				});
			});
		} else {
			// export function foo () {}
			var localName = declaration.id.name;
			this.exports[ localName ] = { localName: localName };
		}
	}

	// export { foo, bar, baz }
	else {
		if ( node.specifiers.length ) {
			node.specifiers.forEach( function (specifier) {
				var localName = specifier.local.name;
				var exportedName = specifier.exported.name;

				if ( this$1.exports[ exportedName ] || this$1.reexports[ exportedName ] ) {
					throw new Error( ("A module cannot have multiple exports with the same name ('" + exportedName + "')") );
				}

				this$1.exports[ exportedName ] = { localName: localName };
			});
		} else {
			this.bundle.onwarn( ("Module " + (this.id) + " has an empty export declaration") );
		}
	}
};

Module.prototype.addImport = function addImport ( statement ) {
		var this$1 = this;

	var node = statement.node;
	var source = node.source.value;

	if ( !~this.sources.indexOf( source ) ) this.sources.push( source );

	node.specifiers.forEach( function (specifier) {
		var localName = specifier.local.name;

		if ( this$1.imports[ localName ] ) {
			var err = new Error( ("Duplicated import '" + localName + "'") );
			err.file = this$1.id;
			err.loc = getLocation( this$1.code, specifier.start );
			throw err;
		}

		var isDefault = specifier.type === 'ImportDefaultSpecifier';
		var isNamespace = specifier.type === 'ImportNamespaceSpecifier';

		var name = isDefault ? 'default' : isNamespace ? '*' : specifier.imported.name;
		this$1.imports[ localName ] = { source: source, name: name, module: null };
	});
};

Module.prototype.analyse = function analyse () {
		var this$1 = this;

	// discover this module's imports and exports
	this.statements.forEach( function (statement) {
		if ( statement.isImportDeclaration ) this$1.addImport( statement );
		else if ( statement.isExportDeclaration ) this$1.addExport( statement );

		statement.firstPass();

		statement.scope.eachDeclaration( function ( name, declaration ) {
			this$1.declarations[ name ] = declaration;
		});
	});
};

Module.prototype.basename = function basename$1 () {
	var base = basename( this.id );
	var ext = extname( this.id );

	return makeLegalIdentifier( ext ? base.slice( 0, -ext.length ) : base );
};

Module.prototype.bindAliases = function bindAliases () {
		var this$1 = this;

	keys( this.declarations ).forEach( function (name) {
		if ( name === '*' ) return;

		var declaration = this$1.declarations[ name ];
		var statement = declaration.statement;

		if ( !statement || statement.node.type !== 'VariableDeclaration' ) return;

		var init = statement.node.declarations[0].init;
			if ( !init || init.type === 'FunctionExpression' ) return;

		statement.references.forEach( function (reference) {
			if ( reference.name === name ) return;

			var otherDeclaration = this$1.trace( reference.name );
			if ( otherDeclaration ) otherDeclaration.addAlias( declaration );
		});
	});
};

Module.prototype.bindImportSpecifiers = function bindImportSpecifiers () {
		var this$1 = this;

	[ this.imports, this.reexports ].forEach( function (specifiers) {
		keys( specifiers ).forEach( function (name) {
			var specifier = specifiers[ name ];

			var id = this$1.resolvedIds[ specifier.source ];
			specifier.module = this$1.bundle.moduleById.get( id );
		});
	});

	this.exportAllModules = this.exportAllSources.map( function (source) {
		var id = this$1.resolvedIds[ source ];
		return this$1.bundle.moduleById.get( id );
	});

	this.sources.forEach( function (source) {
		var id = this$1.resolvedIds[ source ];
		var module = this$1.bundle.moduleById.get( id );

		if ( !module.isExternal ) this$1.dependencies.push( module );
	});
};

Module.prototype.bindReferences = function bindReferences () {
		var this$1 = this;

	if ( this.declarations.default ) {
		if ( this.exports.default.identifier ) {
			var declaration = this.trace( this.exports.default.identifier );
			if ( declaration ) this.declarations.default.bind( declaration );
		}
	}

	this.statements.forEach( function (statement) {
		// skip `export { foo, bar, baz }`...
		if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length ) {
			// ...unless this is the entry module
			if ( this$1 !== this$1.bundle.entryModule ) return;
		}

		statement.references.forEach( function (reference) {
			var declaration = reference.scope.findDeclaration( reference.name ) ||
				                    this$1.trace( reference.name );

			if ( declaration ) {
				declaration.addReference( reference );
			} else {
				// TODO handle globals
				this$1.bundle.assumedGlobals[ reference.name ] = true;
			}
		});
	});
};

Module.prototype.getExports = function getExports () {
	var exports = blank();

	keys( this.exports ).forEach( function (name) {
		exports[ name ] = true;
	});

	keys( this.reexports ).forEach( function (name) {
		exports[ name ] = true;
	});

	this.exportAllModules.forEach( function (module) {
		module.getExports().forEach( function (name) {
			if ( name !== 'default' ) exports[ name ] = true;
		});
	});

	return keys( exports );
};

Module.prototype.namespace = function namespace () {
	if ( !this.declarations['*'] ) {
		this.declarations['*'] = new SyntheticNamespaceDeclaration( this );
	}

	return this.declarations['*'];
};

Module.prototype.parse = function parse$1 () {
		var this$1 = this;

	// The ast can be supplied programmatically (but usually won't be)
	if ( !this.ast ) {
		// Try to extract a list of top-level statements/declarations. If
		// the parse fails, attach file info and abort
		try {
			this.ast = parse( this.code, assign({
				ecmaVersion: 6,
				sourceType: 'module',
				onComment: function ( block, text, start, end ) { return this$1.comments.push({ block: block, text: text, start: start, end: end }); },
				preserveParens: true
			}, this.bundle.acornOptions ));
		} catch ( err ) {
			err.code = 'PARSE_ERROR';
			err.file = this.id; // see above - not necessarily true, but true enough
			err.message += " in " + (this.id);
			throw err;
		}
	}

	walk( this.ast, {
		enter: function (node) {
			// eliminate dead branches early
			if ( node.type === 'IfStatement' ) {
				if ( isFalsy( node.test ) ) {
					this$1.magicString.overwrite( node.consequent.start, node.consequent.end, '{}' );
					node.consequent = emptyBlockStatement( node.consequent.start, node.consequent.end );
				} else if ( node.alternate && isTruthy( node.test ) ) {
					this$1.magicString.overwrite( node.alternate.start, node.alternate.end, '{}' );
					node.alternate = emptyBlockStatement( node.alternate.start, node.alternate.end );
				}
			}

			this$1.magicString.addSourcemapLocation( node.start );
			this$1.magicString.addSourcemapLocation( node.end );
		},

		leave: function ( node, parent, prop ) {
			// eliminate dead branches early
			if ( node.type === 'ConditionalExpression' ) {
					if ( isFalsy( node.test ) ) {
					this$1.magicString.remove( node.start, node.alternate.start );
					parent[prop] = node.alternate;
				} else if ( isTruthy( node.test ) ) {
					this$1.magicString.remove( node.start, node.consequent.start );
					this$1.magicString.remove( node.consequent.end, node.end );
					parent[prop] = node.consequent;
				}
			}
		}
	});

	var statements = [];
	var lastChar = 0;
	var commentIndex = 0;

	this.ast.body.forEach( function (node) {
		if ( node.type === 'EmptyStatement' ) return;

		if (
			node.type === 'ExportNamedDeclaration' &&
			node.declaration &&
			node.declaration.type === 'VariableDeclaration' &&
			node.declaration.declarations &&
			node.declaration.declarations.length > 1
			) {
			// push a synthetic export declaration
			var syntheticNode = {
				type: 'ExportNamedDeclaration',
				specifiers: node.declaration.declarations.map( function (declarator) {
					var id = { name: declarator.id.name };
					return {
						local: id,
						exported: id
					};
				}),
				isSynthetic: true
			};

			var statement = new Statement( syntheticNode, this$1, node.start, node.start );
			statements.push( statement );

			this$1.magicString.remove( node.start, node.declaration.start );
			node = node.declaration;
		}

		// special case - top-level var declarations with multiple declarators
		// should be split up. Otherwise, we may end up including code we
		// don't need, just because an unwanted declarator is included
		if ( node.type === 'VariableDeclaration' && node.declarations.length > 1 ) {
			// remove the leading var/let/const... UNLESS the previous node
			// was also a synthetic node, in which case it'll get removed anyway
			var lastStatement = statements[ statements.length - 1 ];
			if ( !lastStatement || !lastStatement.node.isSynthetic ) {
				this$1.magicString.remove( node.start, node.declarations[0].start );
			}

			node.declarations.forEach( function (declarator) {
				var start = declarator.start;
					var end = declarator.end;

				var syntheticNode = {
					type: 'VariableDeclaration',
					kind: node.kind,
					start: start,
					end: end,
					declarations: [ declarator ],
					isSynthetic: true
				};

				var statement = new Statement( syntheticNode, this$1, start, end );
				statements.push( statement );
			});

			lastChar = node.end; // TODO account for trailing line comment
		}

		else {
			var comment;
			do {
				comment = this$1.comments[ commentIndex ];
				if ( !comment ) break;
				if ( comment.start > node.start ) break;
				commentIndex += 1;
			} while ( comment.end < lastChar );

			var start = comment ? Math.min( comment.start, node.start ) : node.start;
			var end = node.end; // TODO account for trailing line comment

			var statement$1 = new Statement( node, this$1, start, end );
			statements.push( statement$1 );

			lastChar = end;
		}
	});

	var i = statements.length;
	var next = this.code.length;
	while ( i-- ) {
		statements[i].next = next;
		if ( !statements[i].isSynthetic ) next = statements[i].start;
	}

	return statements;
};

Module.prototype.render = function render ( es ) {
		var this$1 = this;

	var magicString = this.magicString.clone();

	this.statements.forEach( function (statement) {
		if ( !statement.isIncluded ) {
			if ( statement.node.type === 'ImportDeclaration' ) {
				magicString.remove( statement.node.start, statement.next );
				return;
			}

			magicString.remove( statement.start, statement.next );
			return;
		}

		statement.stringLiteralRanges.forEach( function (range) { return magicString.indentExclusionRanges.push( range ); } );

		// skip `export { foo, bar, baz }`
		if ( statement.node.type === 'ExportNamedDeclaration' ) {
			if ( statement.node.isSynthetic ) return;

			// skip `export { foo, bar, baz }`
			if ( statement.node.declaration === null ) {
				magicString.remove( statement.start, statement.next );
				return;
			}
		}

		// split up/remove var declarations as necessary
		if ( statement.node.type === 'VariableDeclaration' ) {
			var declarator = statement.node.declarations[0];

			if ( declarator.id.type === 'Identifier' ) {
				var declaration = this$1.declarations[ declarator.id.name ];

				if ( declaration.exportName && declaration.isReassigned ) { // `var foo = ...` becomes `exports.foo = ...`
					magicString.remove( statement.start, declarator.init ? declarator.start : statement.next );
					if ( !declarator.init ) return;
				}
			}

			else {
				// we handle destructuring differently, because whereas we can rewrite
				// `var foo = ...` as `exports.foo = ...`, in a case like `var { a, b } = c()`
				// where `a` or `b` is exported and reassigned, we have to append
				// `exports.a = a;` and `exports.b = b` instead
				extractNames( declarator.id ).forEach( function (name) {
					var declaration = this$1.declarations[ name ];

					if ( declaration.exportName && declaration.isReassigned ) {
						magicString.insertLeft( statement.end, (";\nexports." + name + " = " + (declaration.render( es ))) );
					}
				});
			}

			if ( statement.node.isSynthetic ) {
				// insert `var/let/const` if necessary
				magicString.insertRight( statement.start, ((statement.node.kind) + " ") );
				magicString.insertLeft( statement.end, ';' );
				magicString.overwrite( statement.end, statement.next, '\n' ); // TODO account for trailing newlines
			}
		}

		var toDeshadow = blank();

		statement.references.forEach( function (reference) {
			var start = reference.start;
				var end = reference.end;

			if ( reference.isUndefined ) {
				magicString.overwrite( start, end, 'undefined', true );
			}

			var declaration = reference.declaration;

			if ( declaration ) {
				var name = declaration.render( es );

				// the second part of this check is necessary because of
				// namespace optimisation – name of `foo.bar` could be `bar`
				if ( reference.name === name && name.length === end - start ) return;

				reference.rewritten = true;

				// prevent local variables from shadowing renamed references
				var identifier = name.match( /[^\.]+/ )[0];
				if ( reference.scope.contains( identifier ) ) {
					toDeshadow[ identifier ] = identifier + "$$"; // TODO more robust mechanism
				}

				if ( reference.isShorthandProperty ) {
					magicString.insertLeft( end, (": " + name) );
				} else {
					magicString.overwrite( start, end, name, true );
				}
			}
		});

		if ( keys( toDeshadow ).length ) {
			statement.references.forEach( function (reference) {
				if ( !reference.rewritten && reference.name in toDeshadow ) {
					var replacement = toDeshadow[ reference.name ];
					magicString.overwrite( reference.start, reference.end, reference.isShorthandProperty ? ((reference.name) + ": " + replacement) : replacement, true );
				}
			});
		}

		// modify exports as necessary
		if ( statement.isExportDeclaration ) {
			// remove `export` from `export var foo = 42`
			// TODO: can we do something simpler here?
			// we just want to remove `export`, right?
			if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.declaration.type === 'VariableDeclaration' ) {
				var name = extractNames( statement.node.declaration.declarations[ 0 ].id )[ 0 ];
				var declaration$1 = this$1.declarations[ name ];

				// TODO is this even possible?
				if ( !declaration$1 ) throw new Error( ("Missing declaration for " + name + "!") );

				var end;

				if ( es ) {
					end = statement.node.declaration.start;
				} else {
					if ( declaration$1.exportName && declaration$1.isReassigned ) {
						var declarator$1 = statement.node.declaration.declarations[0];
						end = declarator$1.init ? declarator$1.start : statement.next;
					} else {
						end = statement.node.declaration.start;
					}
				}

				magicString.remove( statement.node.start, end );
			}

			else if ( statement.node.type === 'ExportAllDeclaration' ) {
				// TODO: remove once `export * from 'external'` is supported.
				magicString.remove( statement.start, statement.next );
			}

			// remove `export` from `export class Foo {...}` or `export default Foo`
			// TODO default exports need different treatment
			else if ( statement.node.declaration.id ) {
				magicString.remove( statement.node.start, statement.node.declaration.start );
			}

			else if ( statement.node.type === 'ExportDefaultDeclaration' ) {
				var defaultDeclaration = this$1.declarations.default;

				// prevent `var foo = foo`
				if ( defaultDeclaration.original && !defaultDeclaration.original.isReassigned ) {
					magicString.remove( statement.start, statement.next );
					return;
				}

				var defaultName = defaultDeclaration.render();

				// prevent `var undefined = sideEffectyDefault(foo)`
				if ( !defaultDeclaration.exportName && !defaultDeclaration.isUsed ) {
					magicString.remove( statement.start, statement.node.declaration.start );
					return;
				}

				// anonymous functions should be converted into declarations
				if ( statement.node.declaration.type === 'FunctionExpression' ) {
					magicString.overwrite( statement.node.start, statement.node.declaration.start + 8, ("function " + defaultName) );
				} else {
					magicString.overwrite( statement.node.start, statement.node.declaration.start, ((this$1.bundle.varOrConst) + " " + defaultName + " = ") );
				}
			}

			else {
				throw new Error( 'Unhandled export' );
			}
		}
	});

	// add namespace block if necessary
	var namespace = this.declarations['*'];
	if ( namespace && namespace.needsNamespaceBlock ) {
		magicString.append( '\n\n' + namespace.renderBlock( magicString.getIndentString() ) );
	}

	return magicString.trim();
};

/**
	 * Statically runs the module marking the top-level statements that must be
	 * included for the module to execute successfully.
	 *
	 * @param {boolean} treeshake - if we should tree-shake the module
	 * @return {boolean} marked - if any new statements were marked for inclusion
	 */
Module.prototype.run = function run ( treeshake ) {
		var this$1 = this;

	if ( !treeshake ) {
		this.statements.forEach( function (statement) {
			if ( statement.isImportDeclaration || ( statement.isExportDeclaration && statement.node.isSynthetic ) ) return;

			statement.mark();
		});
		return false;
	}

	var marked = false;

	this.statements.forEach( function (statement) {
		marked = statement.run( this$1.strongDependencies ) || marked;
	});

	return marked;
};

Module.prototype.toJSON = function toJSON () {
	return {
		id: this.id,
		code: this.code,
		originalCode: this.originalCode,
		ast: this.ast,
		sourceMapChain: this.sourceMapChain,
		resolvedIds: this.resolvedIds
	};
};

Module.prototype.trace = function trace ( name ) {
	if ( name in this.declarations ) return this.declarations[ name ];
	if ( name in this.imports ) {
		var importDeclaration = this.imports[ name ];
		var otherModule = importDeclaration.module;

		if ( importDeclaration.name === '*' && !otherModule.isExternal ) {
			return otherModule.namespace();
		}

		var declaration = otherModule.traceExport( importDeclaration.name );

		if ( !declaration ) throw new Error( ("Module " + (otherModule.id) + " does not export " + (importDeclaration.name) + " (imported by " + (this.id) + ")") );
		return declaration;
	}

	return null;
};

Module.prototype.traceExport = function traceExport ( name ) {
		var this$1 = this;

	// export { foo } from './other.js'
	var reexportDeclaration = this.reexports[ name ];
	if ( reexportDeclaration ) {
		var declaration = reexportDeclaration.module.traceExport( reexportDeclaration.localName );

		if ( !declaration ) {
			var err = new Error( ("'" + (reexportDeclaration.localName) + "' is not exported by '" + (reexportDeclaration.module.id) + "' (imported by '" + (this.id) + "')") );
			err.file = this.id;
			err.loc = getLocation( this.code, reexportDeclaration.start );
			throw err;
		}

		return declaration;
	}

	var exportDeclaration = this.exports[ name ];
	if ( exportDeclaration ) {
		var name$1 = exportDeclaration.localName;
		var declaration$1 = this.trace( name$1 );

		if ( declaration$1 ) return declaration$1;

		this.bundle.assumedGlobals[ name$1 ] = true;
		return ( this.declarations[ name$1 ] = new SyntheticGlobalDeclaration( name$1 ) );
	}

	for ( var i = 0; i < this.exportAllModules.length; i += 1 ) {
		var module = this$1.exportAllModules[i];
		var declaration$2 = module.traceExport( name );

		if ( declaration$2 ) return declaration$2;
	}
};

var ExternalModule = function ExternalModule ( id, relativePath ) {
	this.id = id;
	this.path = relativePath;

	this.name = makeLegalIdentifier( relativePath );

	this.nameSuggestions = blank();
	this.mostCommonSuggestion = 0;

	this.isExternal = true;
	this.declarations = blank();

	this.exportsNames = false;
};

ExternalModule.prototype.suggestName = function suggestName ( name ) {
	if ( !this.nameSuggestions[ name ] ) this.nameSuggestions[ name ] = 0;
	this.nameSuggestions[ name ] += 1;

	if ( this.nameSuggestions[ name ] > this.mostCommonSuggestion ) {
		this.mostCommonSuggestion = this.nameSuggestions[ name ];
		this.name = name;
	}
};

ExternalModule.prototype.traceExport = function traceExport ( name ) {
	if ( name !== 'default' && name !== '*' ) this.exportsNames = true;
	if ( name === '*' ) this.exportsNamespace = true;

	return this.declarations[ name ] || (
		this.declarations[ name ] = new ExternalDeclaration( this, name )
	);
};

function getName ( x ) {
	return x.name;
}

function quotePath ( x ) {
	return ("'" + (x.path) + "'");
}

function req ( x ) {
	return ("require('" + (x.path) + "')");
}

function getInteropBlock ( bundle ) {
	return bundle.externalModules
		.map( function (module) {
			if ( !module.declarations.default ) return null;

			if ( module.exportsNamespace ) {
				return ((bundle.varOrConst) + " " + (module.name) + "__default = " + (module.name) + "['default'];");
			}

			if ( module.exportsNames ) {
				return ((bundle.varOrConst) + " " + (module.name) + "__default = 'default' in " + (module.name) + " ? " + (module.name) + "['default'] : " + (module.name) + ";");
			}

			return ((module.name) + " = 'default' in " + (module.name) + " ? " + (module.name) + "['default'] : " + (module.name) + ";");
		})
		.filter( Boolean )
		.join( '\n' );
}

function getExportBlock ( entryModule, exportMode, mechanism ) {
	if ( mechanism === void 0 ) mechanism = 'return';

	if ( exportMode === 'default' ) {
		return (mechanism + " " + (entryModule.traceExport( 'default' ).render( false )) + ";");
	}

	return entryModule.getExports()
		.map( function (name) {
			var prop = name === 'default' ? "['default']" : ("." + name);
			var declaration = entryModule.traceExport( name );

			var lhs = "exports" + prop;
			var rhs = declaration.render( false );

			// prevent `exports.count = exports.count`
			if ( lhs === rhs ) return null;

			return (lhs + " = " + rhs + ";");
		})
		.filter( Boolean )
		.join( '\n' );
}

var esModuleExport = "Object.defineProperty(exports, '__esModule', { value: true });";

function amd ( bundle, magicString, ref, options ) {
	var exportMode = ref.exportMode;
	var indentString = ref.indentString;
	var intro = ref.intro;

	var deps = bundle.externalModules.map( quotePath );
	var args = bundle.externalModules.map( getName );

	if ( exportMode === 'named' ) {
		args.unshift( "exports" );
		deps.unshift( "'exports'" );
	}

	var params =
		( options.moduleId ? ("'" + (options.moduleId) + "', ") : "" ) +
		( deps.length ? ("[" + (deps.join( ', ' )) + "], ") : "" );

	var useStrict = options.useStrict !== false ? " 'use strict';" : "";
	var wrapperStart = "define(" + params + "function (" + (args.join( ', ' )) + ") {" + useStrict + "\n\n";

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	var interopBlock = getInteropBlock( bundle );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	if ( intro ) magicString.prepend( intro );

	var exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( exportMode === 'named' ) magicString.append( ("\n\n" + esModuleExport) );
	if ( options.outro ) magicString.append( ("\n" + (options.outro)) );

	return magicString
		.indent( indentString )
		.append( '\n\n});' )
		.prepend( wrapperStart );
}

function cjs ( bundle, magicString, ref, options ) {
	var exportMode = ref.exportMode;
	var intro = ref.intro;

	intro = ( options.useStrict === false ? intro : ("'use strict';\n\n" + intro) ) +
	        ( exportMode === 'named' ? (esModuleExport + "\n\n") : '' );

	var needsInterop = false;

	var varOrConst = bundle.varOrConst;

	// TODO handle empty imports, once they're supported
	var importBlock = bundle.externalModules
		.map( function (module) {
			if ( module.declarations.default ) {
				if ( module.exportsNamespace ) {
					return varOrConst + " " + (module.name) + " = require('" + (module.path) + "');" +
						"\n" + varOrConst + " " + (module.name) + "__default = " + (module.name) + "['default'];";
				}

				needsInterop = true;

				if ( module.exportsNames ) {
					return varOrConst + " " + (module.name) + " = require('" + (module.path) + "');" +
						"\n" + varOrConst + " " + (module.name) + "__default = _interopDefault(" + (module.name) + ");";
				}

				return (varOrConst + " " + (module.name) + " = _interopDefault(require('" + (module.path) + "'));");
			} else {
				return (varOrConst + " " + (module.name) + " = require('" + (module.path) + "');");
			}
		})
		.join( '\n' );

	if ( needsInterop ) {
		intro += "function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n";
	}

	if ( importBlock ) {
		intro += importBlock + '\n\n';
	}

	magicString.prepend( intro );

	var exportBlock = getExportBlock( bundle.entryModule, exportMode, 'module.exports =' );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( options.outro ) magicString.append( ("\n" + (options.outro)) );

	return magicString;
}

function notDefault ( name ) {
	return name !== 'default';
}

function es ( bundle, magicString, ref, options ) {
	var intro = ref.intro;

	var importBlock = bundle.externalModules
		.map( function (module) {
			var specifiers = [];
			var specifiersList = [specifiers];
			var importedNames = keys( module.declarations )
				.filter( function (name) { return name !== '*' && name !== 'default'; } )
				.map( function (name) {
					var declaration = module.declarations[ name ];

					if ( declaration.name === declaration.safeName ) return declaration.name;
					return ((declaration.name) + " as " + (declaration.safeName));
				});

			if ( module.declarations.default ) {
				if ( module.exportsNamespace ) {
					specifiersList.push([ ((module.name) + "__default") ]);
				} else {
					specifiers.push( module.name );
				}
			}

			var namespaceSpecifier = module.declarations['*'] ? ("* as " + (module.name)) : null;
			var namedSpecifier = importedNames.length ? ("{ " + (importedNames.join( ', ' )) + " }") : null;

			if ( namespaceSpecifier && namedSpecifier ) {
				// Namespace and named specifiers cannot be combined.
				specifiersList.push( [namespaceSpecifier] );
				specifiers.push( namedSpecifier );
			} else if ( namedSpecifier ) {
				specifiers.push( namedSpecifier );
			} else if ( namespaceSpecifier ) {
				specifiers.push( namespaceSpecifier );
			}

			return specifiersList
				.map( function (specifiers) { return specifiers.length ?
						("import " + (specifiers.join( ', ' )) + " from '" + (module.path) + "';") :
						("import '" + (module.path) + "';"); }
				)
				.join( '\n' );
		})
		.join( '\n' );

	if ( importBlock ) intro += importBlock + '\n\n';
	if ( intro ) magicString.prepend( intro );

	var module = bundle.entryModule;

	var specifiers = module.getExports().filter( notDefault ).map( function (name) {
		var declaration = module.traceExport( name );
		var rendered = declaration.render( true );

		return rendered === name ?
			name :
			(rendered + " as " + name);
	});

	var exportBlock = specifiers.length ? ("export { " + (specifiers.join(', ')) + " };") : '';

	var defaultExport = module.exports.default || module.reexports.default;
	if ( defaultExport ) {
		exportBlock += "export default " + (module.traceExport( 'default' ).render( true )) + ";";
	}

	if ( exportBlock ) magicString.append( '\n\n' + exportBlock.trim() );
	if ( options.outro ) magicString.append( ("\n" + (options.outro)) );

	return magicString.trim();
}

function getGlobalNameMaker ( globals, onwarn ) {
	var fn = typeof globals === 'function' ? globals : function (id) { return globals[ id ]; };

	return function ( module ) {
		var name = fn( module.id );
		if ( name ) return name;

		onwarn( ("No name was provided for external module '" + (module.id) + "' in options.globals – guessing '" + (module.name) + "'") );
		return module.name;
	};
}

function setupNamespace ( keypath ) {
	var parts = keypath.split( '.' ); // TODO support e.g. `foo['something-hyphenated']`?

	parts.pop();

	var acc = 'this';

	return parts
		.map( function (part) { return ( acc += "." + part, (acc + " = " + acc + " || {};") ); } )
		.join( '\n' ) + '\n';
}

function iife ( bundle, magicString, ref, options ) {
	var exportMode = ref.exportMode;
	var indentString = ref.indentString;
	var intro = ref.intro;

	var globalNameMaker = getGlobalNameMaker( options.globals || blank(), bundle.onwarn );

	var name = options.moduleName;
	var isNamespaced = name && ~name.indexOf( '.' );

	var dependencies = bundle.externalModules.map( globalNameMaker );

	var args = bundle.externalModules.map( getName );

	if ( exportMode !== 'none' && !name ) {
		throw new Error( 'You must supply options.moduleName for IIFE bundles' );
	}

	if ( exportMode === 'named' ) {
		dependencies.unshift( ("(this." + name + " = this." + name + " || {})") );
		args.unshift( 'exports' );
	}

	var useStrict = options.useStrict !== false ? (indentString + "'use strict';\n\n") : "";

	var wrapperIntro = "(function (" + args + ") {\n" + useStrict;
	var wrapperOutro = "\n\n}(" + dependencies + "));";

	if ( exportMode === 'default' ) {
		wrapperIntro = ( isNamespaced ? "this." : ((bundle.varOrConst) + " ") ) + name + " = " + wrapperIntro;
	}

	if ( isNamespaced ) {
		wrapperIntro = setupNamespace( name ) + wrapperIntro;
	}

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	var interopBlock = getInteropBlock( bundle );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	if ( intro ) magicString.prepend( intro );

	var exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( options.outro ) magicString.append( ("\n" + (options.outro)) );

	return magicString
		.indent( indentString )
		.prepend( wrapperIntro )
		.append( wrapperOutro );
}

function setupNamespace$1 ( name ) {
	var parts = name.split( '.' );
	parts.pop();

	var acc = 'global';
	return parts
		.map( function (part) { return ( acc += "." + part, (acc + " = " + acc + " || {}") ); } )
		.concat( ("global." + name) )
		.join( ', ' );
}

var wrapperOutro = '\n\n})));';

function umd ( bundle, magicString, ref, options ) {
	var exportMode = ref.exportMode;
	var indentString = ref.indentString;
	var intro = ref.intro;

	if ( exportMode !== 'none' && !options.moduleName ) {
		throw new Error( 'You must supply options.moduleName for UMD bundles' );
	}

	var globalNameMaker = getGlobalNameMaker( options.globals || blank(), bundle.onwarn );

	var amdDeps = bundle.externalModules.map( quotePath );
	var cjsDeps = bundle.externalModules.map( req );
	var globalDeps = bundle.externalModules.map( function (module) { return ("global." + (globalNameMaker( module ))); } );

	var args = bundle.externalModules.map( getName );

	if ( exportMode === 'named' ) {
		amdDeps.unshift( "'exports'" );
		cjsDeps.unshift( "exports" );
		globalDeps.unshift( ("(" + (setupNamespace$1(options.moduleName)) + " = global." + (options.moduleName) + " || {})") );

		args.unshift( 'exports' );
	}

	var amdParams =
		( options.moduleId ? ("'" + (options.moduleId) + "', ") : "" ) +
		( amdDeps.length ? ("[" + (amdDeps.join( ', ' )) + "], ") : "" );

	var cjsExport = exportMode === 'default' ? "module.exports = " : "";
	var defaultExport = exportMode === 'default' ? ((setupNamespace$1(options.moduleName)) + " = ") : '';

	var useStrict = options.useStrict !== false ? " 'use strict';" : "";

	var globalExport = options.noConflict === true ?
		("(function() {\n\t\t\t\tvar current = global." + (options.moduleName) + ";\n\t\t\t\tvar exports = factory(" + globalDeps + ");\n\t\t\t\tglobal." + (options.moduleName) + " = exports;\n\t\t\t\texports.noConflict = function() { global." + (options.moduleName) + " = current; return exports; };\n\t\t\t})()") : ("(" + defaultExport + "factory(" + globalDeps + "))");

	var wrapperIntro =
		("(function (global, factory) {\n\t\t\ttypeof exports === 'object' && typeof module !== 'undefined' ? " + cjsExport + "factory(" + (cjsDeps.join( ', ' )) + ") :\n\t\t\ttypeof define === 'function' && define.amd ? define(" + amdParams + "factory) :\n\t\t\t" + globalExport + ";\n\t\t}(this, (function (" + args + ") {" + useStrict + "\n\n\t\t").replace( /^\t\t/gm, '' ).replace( /^\t/gm, magicString.getIndentString() );

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	var interopBlock = getInteropBlock( bundle );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	if ( intro ) magicString.prepend( intro );

	var exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( exportMode === 'named' ) magicString.append( ("\n\n" + esModuleExport) );
	if ( options.outro ) magicString.append( ("\n" + (options.outro)) );

	return magicString
		.trim()
		.indent( indentString )
		.append( wrapperOutro )
		.prepend( wrapperIntro );
}

var finalisers = { amd: amd, cjs: cjs, es: es, iife: iife, umd: umd };

function ensureArray ( thing ) {
	if ( Array.isArray( thing ) ) return thing;
	if ( thing == undefined ) return [];
	return [ thing ];
}

function load ( id ) {
	return readFileSync( id, 'utf-8' );
}

function addJsExtensionIfNecessary ( file ) {
	try {
		var name = basename( file );
		var files = readdirSync( dirname( file ) );

		if ( ~files.indexOf( name ) && isFile( file ) ) return file;
		if ( ~files.indexOf( (name + ".js") ) && isFile( (file + ".js") ) ) return (file + ".js");
	} catch ( err ) {
		// noop
	}

	return null;
}

function resolveId ( importee, importer ) {
	if ( typeof process === 'undefined' ) throw new Error( "It looks like you're using Rollup in a non-Node.js environment. This means you must supply a plugin with custom resolveId and load functions. See https://github.com/rollup/rollup/wiki/Plugins for more information" );

	// absolute paths are left untouched
	if ( isAbsolute( importee ) ) return addJsExtensionIfNecessary( resolve( importee ) );

	// if this is the entry point, resolve against cwd
	if ( importer === undefined ) return addJsExtensionIfNecessary( resolve( process.cwd(), importee ) );

	// external modules are skipped at this stage
	if ( importee[0] !== '.' ) return null;

	return addJsExtensionIfNecessary( resolve( dirname( importer ), importee ) );
}


function makeOnwarn () {
	var warned = blank();

	return function (msg) {
		if ( msg in warned ) return;
		console.error( msg ); //eslint-disable-line no-console
		warned[ msg ] = true;
	};
}

function badExports ( option, keys ) {
	throw new Error( ("'" + option + "' was specified for options.exports, but entry module has following exports: " + (keys.join(', '))) );
}

function getExportMode ( bundle, exportMode, moduleName ) {
	var exportKeys = keys( bundle.entryModule.exports )
		.concat( keys( bundle.entryModule.reexports ) )
		.concat( bundle.entryModule.exportAllSources ); // not keys, but makes our job easier this way

	if ( exportMode === 'default' ) {
		if ( exportKeys.length !== 1 || exportKeys[0] !== 'default' ) {
			badExports( 'default', exportKeys );
		}
	} else if ( exportMode === 'none' && exportKeys.length ) {
		badExports( 'none', exportKeys );
	}

	if ( !exportMode || exportMode === 'auto' ) {
		if ( exportKeys.length === 0 ) {
			exportMode = 'none';
		} else if ( exportKeys.length === 1 && exportKeys[0] === 'default' ) {
			exportMode = 'default';
		} else {
			if ( bundle.entryModule.exports.default ) {
				bundle.onwarn( ("Using named and default exports together. Consumers of your bundle will have to use " + (moduleName || 'bundle') + "['default'] to access the default export, which may not be what you want. Use `exports: 'named'` to disable this warning. See https://github.com/rollup/rollup/wiki/JavaScript-API#exports for more information") );
			}
			exportMode = 'named';
		}
	}

	if ( !/(?:default|named|none)/.test( exportMode ) ) {
		throw new Error( "options.exports must be 'default', 'named', 'none', 'auto', or left unspecified (defaults to 'auto')" );
	}

	return exportMode;
}

function getIndentString ( magicString, options ) {
	if ( options.indent === true ) {
		return magicString.getIndentString();
	}

	return options.indent || '';
}

function transform ( source, id, plugins ) {
	var sourceMapChain = [];

	var originalSourceMap = typeof source.map === 'string' ? JSON.parse( source.map ) : source.map;

	if ( originalSourceMap && typeof originalSourceMap.mappings === 'string' ) {
		originalSourceMap.mappings = decode( originalSourceMap.mappings );
	}

	var originalCode = source.code;
	var ast = source.ast;

	return plugins.reduce( function ( promise, plugin ) {
		return promise.then( function (previous) {
			if ( !plugin.transform ) return previous;

			return Promise.resolve( plugin.transform( previous, id ) ).then( function (result) {
				if ( result == null ) return previous;

				if ( typeof result === 'string' ) {
					result = {
						code: result,
						ast: null,
						map: null
					};
				}
				// `result.map` can only be a string if `result` isn't
				else if ( typeof result.map === 'string' ) {
					result.map = JSON.parse( result.map );
				}

				if ( result.map && typeof result.map.mappings === 'string' ) {
					result.map.mappings = decode( result.map.mappings );
				}

				sourceMapChain.push( result.map || { missing: true, plugin: plugin.name }); // lil' bit hacky but it works
				ast = result.ast;

				return result.code;
			});
		}).catch( function (err) {
			if ( !err.rollupTransform ) {
				err.rollupTransform = true;
				err.id = id;
				err.plugin = plugin.name;
				err.message = "Error transforming " + id + (plugin.name ? (" with '" + (plugin.name) + "' plugin") : '') + ": " + (err.message);
			}
			throw err;
		});
	}, Promise.resolve( source.code ) )

	.then( function (code) { return ({ code: code, originalCode: originalCode, originalSourceMap: originalSourceMap, ast: ast, sourceMapChain: sourceMapChain }); } );
}

function transformBundle ( code, plugins, sourceMapChain, options ) {
	return plugins.reduce( function ( code, plugin ) {
		if ( !plugin.transformBundle ) return code;

		var result;

		try {
			result = plugin.transformBundle( code, { format : options.format } );
		} catch ( err ) {
			err.plugin = plugin.name;
			err.message = "Error transforming bundle" + (plugin.name ? (" with '" + (plugin.name) + "' plugin") : '') + ": " + (err.message);
			throw err;
		}

		if ( result == null ) return code;

		if ( typeof result === 'string' ) {
			result = {
				code: result,
				map: null
			};
		}

		var map = typeof result.map === 'string' ? JSON.parse( result.map ) : result.map;
		if ( map && typeof map.mappings === 'string' ) {
			map.mappings = decode( map.mappings );
		}

		sourceMapChain.push( map );

		return result.code;
	}, code );
}

var Source = function Source ( filename, content ) {
	this.isOriginal = true;
	this.filename = filename;
	this.content = content;
};

Source.prototype.traceSegment = function traceSegment ( line, column, name ) {
	return { line: line, column: column, name: name, source: this };
};

var Link = function Link ( map, sources ) {
	this.sources = sources;
	this.names = map.names;
	this.mappings = map.mappings;
};

Link.prototype.traceMappings = function traceMappings () {
		var this$1 = this;

	var sources = [];
	var sourcesContent = [];
	var names = [];

	var mappings = this.mappings.map( function (line) {
		var tracedLine = [];

		line.forEach( function (segment) {
			var source = this$1.sources[ segment[1] ];
			var traced = source.traceSegment( segment[2], segment[3], this$1.names[ segment[4] ] );

			if ( traced ) {
				var sourceIndex = null;
				var nameIndex = null;
				segment = [
					segment[0],
					null,
					traced.line,
					traced.column
				];

				// newer sources are more likely to be used, so search backwards.
				sourceIndex = sources.lastIndexOf( traced.source.filename );
				if ( sourceIndex === -1 ) {
					sourceIndex = sources.length;
					sources.push( traced.source.filename );
					sourcesContent[ sourceIndex ] = traced.source.content;
				} else if ( sourcesContent[ sourceIndex ] == null ) {
					sourcesContent[ sourceIndex ] = traced.source.content;
				} else if ( traced.source.content != null && sourcesContent[ sourceIndex ] !== traced.source.content ) {
					throw new Error( ("Multiple conflicting contents for sourcemap source " + (source.filename)) );
				}

				segment[1] = sourceIndex;

				if ( traced.name ) {
					nameIndex = names.indexOf( traced.name );
					if ( nameIndex === -1 ) {
						nameIndex = names.length;
						names.push( traced.name );
					}

					segment[4] = nameIndex;
				}

				tracedLine.push( segment );
			}
		});

		return tracedLine;
	});

	return { sources: sources, sourcesContent: sourcesContent, names: names, mappings: mappings };
};

Link.prototype.traceSegment = function traceSegment ( line, column, name ) {
		var this$1 = this;

	var segments = this.mappings[ line ];

	if ( !segments ) return null;

	for ( var i = 0; i < segments.length; i += 1 ) {
		var segment = segments[i];

		if ( segment[0] > column ) return null;

		if ( segment[0] === column ) {
			var source = this$1.sources[ segment[1] ];
			if ( !source ) return null;

			return source.traceSegment( segment[2], segment[3], this$1.names[ segment[4] ] || name );
		}
	}

	return null;
};

function collapseSourcemaps ( file, map, modules, bundleSourcemapChain, onwarn ) {
	var moduleSources = modules.filter( function (module) { return !module.excludeFromSourcemap; } ).map( function (module) {
		var sourceMapChain = module.sourceMapChain;

		var source;
		if ( module.originalSourceMap == null ) {
			source = new Source( module.id, module.originalCode );
		} else {
			var sources = module.originalSourceMap.sources;
			var sourcesContent = module.originalSourceMap.sourcesContent || [];

			if ( sources == null || ( sources.length <= 1 && sources[0] == null ) ) {
				source = new Source( module.id, sourcesContent[0] );
				sourceMapChain = [ module.originalSourceMap ].concat( sourceMapChain );
			} else {
				// TODO indiscriminately treating IDs and sources as normal paths is probably bad.
				var directory = dirname( module.id ) || '.';
				var sourceRoot = module.originalSourceMap.sourceRoot || '.';

				var baseSources = sources.map( function (source, i) {
					return new Source( resolve( directory, sourceRoot, source ), sourcesContent[i] );
				});

				source = new Link( module.originalSourceMap, baseSources );
			}
		}

		sourceMapChain.forEach( function (map) {
			if ( map.missing ) {
				onwarn( ("Sourcemap is likely to be incorrect: a plugin" + (map.plugin ? (" ('" + (map.plugin) + "')") : "") + " was used to transform files, but didn't generate a sourcemap for the transformation. Consult https://github.com/rollup/rollup/wiki/Troubleshooting and the plugin documentation for more information") );

				map = {
					names: [],
					mappings: ''
				};
			}

			source = new Link( map, [ source ]);
		});

		return source;
	});

	var source = new Link( map, moduleSources );

	bundleSourcemapChain.forEach( function (map) {
		source = new Link( map, [ source ] );
	});

	var ref = source.traceMappings();
	var sources = ref.sources;
	var sourcesContent = ref.sourcesContent;
	var names = ref.names;
	var mappings = ref.mappings;

	if ( file ) {
		var directory = dirname( file );
		sources = sources.map( function (source) { return relative( directory, source ); } );
	}

	// we re-use the `map` object because it has convenient toString/toURL methods
	map.sources = sources;
	map.sourcesContent = sourcesContent;
	map.names = names;
	map.mappings = encode( mappings );

	return map;
}

function callIfFunction ( thing ) {
	return typeof thing === 'function' ? thing() : thing;
}

var Bundle = function Bundle ( options ) {
	var this$1 = this;

	this.cachedModules = new Map();
	if ( options.cache ) {
		options.cache.modules.forEach( function (module) {
			this$1.cachedModules.set( module.id, module );
		});
	}

	this.plugins = ensureArray( options.plugins );

	this.plugins.forEach( function (plugin) {
		if ( plugin.options ) {
			options = plugin.options( options ) || options;
		}
	});

	this.entry = options.entry;
	this.entryId = null;
	this.entryModule = null;

	this.treeshake = options.treeshake !== false;

	this.resolveId = first(
		[ function (id) { return this$1.isExternal( id ) ? false : null; } ]
			.concat( this.plugins.map( function (plugin) { return plugin.resolveId; } ).filter( Boolean ) )
			.concat( resolveId )
	);

	var loaders = this.plugins
		.map( function (plugin) { return plugin.load; } )
		.filter( Boolean );
	this.hasLoaders = loaders.length !== 0;
	this.load = first( loaders.concat( load ) );

	this.getPath = typeof options.paths === 'function' ?
		( function (id) { return options.paths( id ) || this$1.getPathRelativeToEntryDirname( id ); } ) :
		options.paths ?
			( function (id) { return options.paths.hasOwnProperty( id ) ? options.paths[ id ] : this$1.getPathRelativeToEntryDirname( id ); } ) :
			function (id) { return this$1.getPathRelativeToEntryDirname( id ); };

	this.moduleById = new Map();
	this.modules = [];

	this.externalModules = [];
	this.internalNamespaces = [];

	this.context = String( options.context );
	this.assumedGlobals = blank();

	if ( typeof options.external === 'function' ) {
		this.isExternal = options.external;
	} else {
		var ids = ensureArray( options.external );
		this.isExternal = function (id) { return ids.indexOf( id ) !== -1; };
	}

	this.onwarn = options.onwarn || makeOnwarn();

	// TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
	[ 'module', 'exports', '_interopDefault' ].forEach( function (global) { return this$1.assumedGlobals[ global ] = true; } );

	this.varOrConst = options.preferConst ? 'const' : 'var';
	this.acornOptions = options.acorn || {};
};

Bundle.prototype.build = function build () {
		var this$1 = this;

	// Phase 1 – discovery. We load the entry module and find which
	// modules it imports, and import those, until we have all
	// of the entry module's dependencies
	return this.resolveId( this.entry, undefined )
		.then( function (id) {
			if ( id == null ) throw new Error( ("Could not resolve entry (" + (this$1.entry) + ")") );
			this$1.entryId = id;
			return this$1.fetchModule( id, undefined );
		})
		.then( function (entryModule) {
			this$1.entryModule = entryModule;

			// Phase 2 – binding. We link references to their declarations
			// to generate a complete picture of the bundle
			this$1.modules.forEach( function (module) { return module.bindImportSpecifiers(); } );
			this$1.modules.forEach( function (module) { return module.bindAliases(); } );
			this$1.modules.forEach( function (module) { return module.bindReferences(); } );

			// Phase 3 – marking. We 'run' each statement to see which ones
			// need to be included in the generated bundle

			// mark all export statements
			entryModule.getExports().forEach( function (name) {
				var declaration = entryModule.traceExport( name );
				declaration.exportName = name;

				declaration.use();
			});

			// mark statements that should appear in the bundle
			var settled = false;
			while ( !settled ) {
				settled = true;

				this$1.modules.forEach( function (module) {
					if ( module.run( this$1.treeshake ) ) settled = false;
				});
			}

			// Phase 4 – final preparation. We order the modules with an
			// enhanced topological sort that accounts for cycles, then
			// ensure that names are deconflicted throughout the bundle
			this$1.orderedModules = this$1.sort();
			this$1.deconflict();
		});
};

Bundle.prototype.deconflict = function deconflict () {
	var used = blank();

	// ensure no conflicts with globals
	keys( this.assumedGlobals ).forEach( function (name) { return used[ name ] = 1; } );

	function getSafeName ( name ) {
		while ( used[ name ] ) {
			name += "$" + (used[name]++);
		}

		used[ name ] = 1;
		return name;
	}

	this.externalModules.forEach( function (module) {
		module.name = getSafeName( module.name );

		// ensure we don't shadow named external imports, if
		// we're creating an ES6 bundle
		forOwn( module.declarations, function ( declaration, name ) {
			declaration.setSafeName( getSafeName( name ) );
		});
	});

	this.modules.forEach( function (module) {
		forOwn( module.declarations, function ( declaration, originalName ) {
			if ( declaration.isGlobal ) return;

			if ( originalName === 'default' ) {
				if ( declaration.original && !declaration.original.isReassigned ) return;
			}

			declaration.name = getSafeName( declaration.name );
		});
	});
};

Bundle.prototype.fetchModule = function fetchModule ( id, importer ) {
		var this$1 = this;

	// short-circuit cycles
	if ( this.moduleById.has( id ) ) return null;
	this.moduleById.set( id, null );

	return this.load( id )
		.catch( function (err) {
			var msg = "Could not load " + id;
			if ( importer ) msg += " (imported by " + importer + ")";

			msg += ": " + (err.message);
			throw new Error( msg );
		})
		.then( function (source) {
			if ( typeof source === 'string' ) return source;
			if ( source && typeof source === 'object' && source.code ) return source;

			throw new Error( ("Error loading " + id + ": load hook should return a string, a { code, map } object, or nothing/null") );
		})
		.then( function (source) {
			if ( typeof source === 'string' ) {
				source = {
					code: source,
					ast: null
				};
			}

			if ( this$1.cachedModules.has( id ) && this$1.cachedModules.get( id ).originalCode === source.code ) {
				return this$1.cachedModules.get( id );
			}

			return transform( source, id, this$1.plugins );
		})
		.then( function (source) {
			var code = source.code;
				var originalCode = source.originalCode;
				var originalSourceMap = source.originalSourceMap;
				var ast = source.ast;
				var sourceMapChain = source.sourceMapChain;
				var resolvedIds = source.resolvedIds;

			var module = new Module({
				id: id,
				code: code,
				originalCode: originalCode,
				originalSourceMap: originalSourceMap,
				ast: ast,
				sourceMapChain: sourceMapChain,
				resolvedIds: resolvedIds,
				bundle: this$1
			});

			this$1.modules.push( module );
			this$1.moduleById.set( id, module );

			return this$1.fetchAllDependencies( module ).then( function () {
				keys( module.exports ).forEach( function (name) {
					module.exportsAll[name] = module.id;
				});
				module.exportAllSources.forEach( function (source) {
					var id = module.resolvedIds[ source ];
					var exportAllModule = this$1.moduleById.get( id );
					if ( exportAllModule.isExternal ) return;

					keys( exportAllModule.exportsAll ).forEach( function (name) {
						if ( name in module.exportsAll ) {
							this$1.onwarn( ("Conflicting namespaces: " + (module.id) + " re-exports '" + name + "' from both " + (module.exportsAll[ name ]) + " (will be ignored) and " + (exportAllModule.exportsAll[ name ]) + ".") );
						}
						module.exportsAll[ name ] = exportAllModule.exportsAll[ name ];
					});
					});
					return module;
			});
		});
};

Bundle.prototype.fetchAllDependencies = function fetchAllDependencies ( module ) {
		var this$1 = this;

	return mapSequence( module.sources, function (source) {
		var resolvedId = module.resolvedIds[ source ];
		return ( resolvedId ? Promise.resolve( resolvedId ) : this$1.resolveId( source, module.id ) )
			.then( function (resolvedId) {
				var externalId = resolvedId || (
					isRelative( source ) ? resolve( module.id, '..', source ) : source
				);

				var isExternal = this$1.isExternal( externalId );

				if ( !resolvedId && !isExternal ) {
					if ( isRelative( source ) ) throw new Error( ("Could not resolve '" + source + "' from " + (module.id)) );

					this$1.onwarn( ("Treating '" + source + "' as external dependency") );
					isExternal = true;
				}

				if ( isExternal ) {
					module.resolvedIds[ source ] = externalId;

					if ( !this$1.moduleById.has( externalId ) ) {
						var module$1 = new ExternalModule( externalId, this$1.getPath( externalId ) );
						this$1.externalModules.push( module$1 );
						this$1.moduleById.set( externalId, module$1 );
					}
				} else {
					if ( resolvedId === module.id ) {
						throw new Error( ("A module cannot import itself (" + resolvedId + ")") );
					}

					module.resolvedIds[ source ] = resolvedId;
					return this$1.fetchModule( resolvedId, module.id );
				}
			});
	});
};

Bundle.prototype.getPathRelativeToEntryDirname = function getPathRelativeToEntryDirname ( resolvedId ) {
	if ( isRelative( resolvedId ) || isAbsolute( resolvedId ) ) {
		var entryDirname = dirname( this.entryId );
		var relativeToEntry = normalize( relative( entryDirname, resolvedId ) );

		return isRelative( relativeToEntry ) ? relativeToEntry : ("./" + relativeToEntry);
	}

	return resolvedId;
};

Bundle.prototype.render = function render ( options ) {
		if ( options === void 0 ) options = {};

	if ( options.format === 'es6' ) {
		this.onwarn( 'The es6 format is deprecated – use `es` instead' );
		options.format = 'es';
	}

	var format = options.format || 'es';

	// Determine export mode - 'default', 'named', 'none'
	var exportMode = getExportMode( this, options.exports, options.moduleName );

	var magicString = new Bundle$1({ separator: '\n\n' });
	var usedModules = [];

	this.orderedModules.forEach( function (module) {
		var source = module.render( format === 'es' );
		if ( source.toString().length ) {
			magicString.addSource( source );
			usedModules.push( module );
		}
	});

	var intro = [ options.intro ]
		.concat(
			this.plugins.map( function (plugin) { return plugin.intro && plugin.intro(); } )
		)
		.filter( Boolean )
		.join( '\n\n' );

	if ( intro ) intro += '\n';

	var indentString = getIndentString( magicString, options );

	var finalise = finalisers[ format ];
	if ( !finalise ) throw new Error( ("You must specify an output type - valid options are " + (keys( finalisers ).join( ', ' ))) );

	magicString = finalise( this, magicString.trim(), { exportMode: exportMode, indentString: indentString, intro: intro }, options );

	var banner = [ options.banner ]
		.concat( this.plugins.map( function (plugin) { return plugin.banner; } ) )
		.map( callIfFunction )
		.filter( Boolean )
		.join( '\n' );

	var footer = [ options.footer ]
		.concat( this.plugins.map( function (plugin) { return plugin.footer; } ) )
		.map( callIfFunction )
		.filter( Boolean )
		.join( '\n' );

	if ( banner ) magicString.prepend( banner + '\n' );
	if ( footer ) magicString.append( '\n' + footer );

	var code = magicString.toString();
	var map = null;
	var bundleSourcemapChain = [];

	code = transformBundle( code, this.plugins, bundleSourcemapChain, options )
		.replace( new RegExp( ("\\/\\/#\\s+" + SOURCEMAPPING_URL$1 + "=.+\\n?"), 'g' ), '' );

	if ( options.sourceMap ) {
		var file = options.sourceMapFile || options.dest;
		if ( file ) file = resolve( typeof process !== 'undefined' ? process.cwd() : '', file );

		if ( this.hasLoaders || find( this.plugins, function (plugin) { return plugin.transform || plugin.transformBundle; } ) ) {
			map = magicString.generateMap( {} );
			if ( typeof map.mappings === 'string' ) {
				map.mappings = decode( map.mappings );
			}
			map = collapseSourcemaps( file, map, usedModules, bundleSourcemapChain, this.onwarn );
		} else {
			map = magicString.generateMap({ file: file, includeContent: true });
		}

		map.sources = map.sources.map( normalize );
	}

	return { code: code, map: map };
};

Bundle.prototype.sort = function sort () {
		var this$1 = this;

	var hasCycles;
	var seen = {};
	var ordered = [];

	var stronglyDependsOn = blank();
	var dependsOn = blank();

	this.modules.forEach( function (module) {
		stronglyDependsOn[ module.id ] = blank();
		dependsOn[ module.id ] = blank();
	});

	this.modules.forEach( function (module) {
		function processStrongDependency ( dependency ) {
			if ( dependency === module || stronglyDependsOn[ module.id ][ dependency.id ] ) return;

			stronglyDependsOn[ module.id ][ dependency.id ] = true;
			dependency.strongDependencies.forEach( processStrongDependency );
		}

		function processDependency ( dependency ) {
			if ( dependency === module || dependsOn[ module.id ][ dependency.id ] ) return;

			dependsOn[ module.id ][ dependency.id ] = true;
				dependency.dependencies.forEach( processDependency );
		}

		module.strongDependencies.forEach( processStrongDependency );
		module.dependencies.forEach( processDependency );
	});

	var visit = function (module) {
		if ( seen[ module.id ] ) {
			hasCycles = true;
			return;
		}

		seen[ module.id ] = true;

		module.dependencies.forEach( visit );
		ordered.push( module );
	};

	visit( this.entryModule );

	if ( hasCycles ) {
		ordered.forEach( function ( a, i ) {
			var loop = function (  ) {
				var b = ordered[i];

				if ( stronglyDependsOn[ a.id ][ b.id ] ) {
					// somewhere, there is a module that imports b before a. Because
						// b imports a, a is placed before b. We need to find the module
						// in question, so we can provide a useful error message
					var parent = '[[unknown]]';
					var visited = {};

					var findParent = function (module) {
						if ( dependsOn[ module.id ][ a.id ] && dependsOn[ module.id ][ b.id ] ) {
							parent = module.id;
							return true;
						}
						visited[ module.id ] = true;
						for ( var i = 0; i < module.dependencies.length; i += 1 ) {
							var dependency = module.dependencies[i];
							if ( !visited[ dependency.id ] && findParent( dependency ) ) return true;
						}
					};

					findParent( this$1.entryModule );

					this$1.onwarn(
						("Module " + (a.id) + " may be unable to evaluate without " + (b.id) + ", but is included first due to a cyclical dependency. Consider swapping the import statements in " + parent + " to ensure correct ordering")
					);
				}
			};

				for ( i += 1; i < ordered.length; i += 1 ) loop(  );
		});
	}

	return ordered;
};

var VERSION = '0.34.13';

var ALLOWED_KEYS = [
	'acorn',
	'banner',
	'cache',
	'context',
	'dest',
	'entry',
	'exports',
	'external',
	'footer',
	'format',
	'globals',
	'indent',
	'intro',
	'moduleId',
	'moduleName',
	'noConflict',
	'onwarn',
	'outro',
	'paths',
	'plugins',
	'preferConst',
	'sourceMap',
	'sourceMapFile',
	'targets',
	'treeshake',
	'useStrict'
];

function rollup ( options ) {
	if ( !options || !options.entry ) {
		return Promise.reject( new Error( 'You must supply options.entry to rollup' ) );
	}

	if ( options.transform || options.load || options.resolveId || options.resolveExternal ) {
		return Promise.reject( new Error( 'The `transform`, `load`, `resolveId` and `resolveExternal` options are deprecated in favour of a unified plugin API. See https://github.com/rollup/rollup/wiki/Plugins for details' ) );
	}

	var error = validateKeys( options, ALLOWED_KEYS );

	if ( error ) {
		return Promise.reject( error );
	}

	var bundle = new Bundle( options );

	return bundle.build().then( function () {
		function generate ( options ) {
			var rendered = bundle.render( options );

			bundle.plugins.forEach( function (plugin) {
				if ( plugin.ongenerate ) {
					plugin.ongenerate( assign({
						bundle: result
					}, options ), rendered);
				}
			});

			return rendered;
		}

		var result = {
			imports: bundle.externalModules.map( function (module) { return module.id; } ),
			exports: keys( bundle.entryModule.exports ),
			modules: bundle.orderedModules.map( function (module) { return module.toJSON(); } ),

			generate: generate,
			write: function (options) {
				if ( !options || !options.dest ) {
					throw new Error( 'You must supply options.dest to bundle.write' );
				}

				var dest = options.dest;
				var output = generate( options );
				var code = output.code;
				var map = output.map;

				var promises = [];

				if ( options.sourceMap ) {
					var url;

					if ( options.sourceMap === 'inline' ) {
						url = map.toUrl();
					} else {
						url = (basename( dest )) + ".map";
						promises.push( writeFile( dest + '.map', map.toString() ) );
					}

					code += "\n//# " + SOURCEMAPPING_URL$1 + "=" + url + "\n";
				}

				promises.push( writeFile( dest, code ) );
				return Promise.all( promises ).then( function () {
					return mapSequence( bundle.plugins.filter( function (plugin) { return plugin.onwrite; } ), function (plugin) {
						return Promise.resolve( plugin.onwrite( assign({
							bundle: result
						}, options ), output));
					});
				});
			}
		};

		return result;
	});
}

export { VERSION, rollup };
//# sourceMappingURL=rollup.es.js.map
