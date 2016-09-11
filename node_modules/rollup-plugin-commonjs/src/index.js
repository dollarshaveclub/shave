import { statSync } from 'fs';
import { dirname, extname, resolve, sep } from 'path';
import { sync as nodeResolveSync } from 'resolve';
import { createFilter } from 'rollup-pluginutils';
import MagicString from 'magic-string';
import { EXTERNAL, PREFIX, HELPERS_ID, HELPERS } from './helpers.js';
import defaultResolver from './defaultResolver.js';
import transform from './transform.js';
import { getName } from './utils.js';

function getCandidatesForExtension ( resolved, extension ) {
	return [
		resolved + extension,
		resolved + `${sep}index${extension}`
	];
}

function getCandidates ( resolved, extensions ) {
	return extensions.reduce(
		( paths, extension ) => paths.concat( getCandidatesForExtension ( resolved, extension ) ),
		[resolved]
	);
}

// Return the first non-falsy result from an array of
// maybe-sync, maybe-promise-returning functions
function first ( candidates ) {
	return function ( ...args ) {
		return candidates.reduce( ( promise, candidate ) => {
			return promise.then( result => result != null ?
				result :
				Promise.resolve( candidate( ...args ) ) );
		}, Promise.resolve() );
	};
}

function startsWith ( str, prefix ) {
	return str.slice( 0, prefix.length ) === prefix;
}


export default function commonjs ( options = {} ) {
	const extensions = options.extensions || ['.js'];
	const filter = createFilter( options.include, options.exclude );
	const ignoreGlobal = options.ignoreGlobal;

	let customNamedExports = {};
	if ( options.namedExports ) {
		Object.keys( options.namedExports ).forEach( id => {
			let resolvedId;

			try {
				resolvedId = nodeResolveSync( id, { basedir: process.cwd() });
			} catch ( err ) {
				resolvedId = resolve( id );
			}

			customNamedExports[ resolvedId ] = options.namedExports[ id ];
		});
	}

	let entryModuleIdPromise = null;
	let entryModuleId = null;

	function resolveId ( importee, importer ) {
		if ( importee === HELPERS_ID ) return importee;

		if ( importer && startsWith( importer, PREFIX ) ) importer = importer.slice( PREFIX.length );

		const isProxyModule = startsWith( importee, PREFIX );
		if ( isProxyModule ) importee = importee.slice( PREFIX.length );

		return resolveUsingOtherResolvers( importee, importer ).then( resolved => {
			if ( resolved ) return isProxyModule ? PREFIX + resolved : resolved;

			resolved = defaultResolver( importee, importer );

			if ( isProxyModule ) {
				if ( resolved ) return PREFIX + resolved;
				return EXTERNAL + importee; // external
			}

			return resolved;
		});
	}

	const sourceMap = options.sourceMap !== false;

	let commonjsModules = new Map();
	let resolveUsingOtherResolvers;

	return {
		name: 'commonjs',

		options ( options ) {
			const resolvers = ( options.plugins || [] )
				.map( plugin => {
					if ( plugin.resolveId === resolveId ) {
						// substitute CommonJS resolution logic
						return ( importee, importer ) => {
							if ( importee[0] !== '.' || !importer ) return; // not our problem

							const resolved = resolve( dirname( importer ), importee );
							const candidates = getCandidates( resolved, extensions );

							for ( let i = 0; i < candidates.length; i += 1 ) {
								try {
									const stats = statSync( candidates[i] );
									if ( stats.isFile() ) return candidates[i];
								} catch ( err ) { /* noop */ }
							}
						};
					}

					return plugin.resolveId;
				})
				.filter( Boolean );

			resolveUsingOtherResolvers = first( resolvers );

			entryModuleIdPromise = resolveId( options.entry ).then( resolved => {
				entryModuleId = resolved;
			});
		},

		resolveId,

		load ( id ) {
			if ( id === HELPERS_ID ) return HELPERS;

			// generate proxy modules
			if ( startsWith( id, EXTERNAL ) ) {
				const actualId = id.slice( EXTERNAL.length );
				const name = getName( actualId );

				return `import ${name} from ${JSON.stringify( actualId )}; export default ${name};`;
			}

			if ( startsWith( id, PREFIX ) ) {
				const actualId = id.slice( PREFIX.length );
				const name = getName( actualId );

				return commonjsModules.has( actualId ) ?
					`import { __moduleExports } from ${JSON.stringify( actualId )}; export default __moduleExports;` :
					`import * as ${name} from ${JSON.stringify( actualId )}; export default ( ${name} && ${name}['default'] ) || ${name};`;
			}
		},

		transform ( code, id ) {
			if ( !filter( id ) ) return null;
			if ( extensions.indexOf( extname( id ) ) === -1 ) return null;

			return entryModuleIdPromise.then( () => {
				const transformed = transform( code, id, id === entryModuleId, ignoreGlobal, customNamedExports[ id ], sourceMap );

				if ( transformed ) {
					commonjsModules.set( id, true );
					return transformed;
				}
			});
		},

		transformBundle ( code ) {
			// prevent external dependencies from having the prefix
			const magicString = new MagicString( code );
			const pattern = new RegExp( PREFIX, 'g' );

			if ( !pattern.test( code ) ) return null;

			let match;
			while ( match = pattern.exec( code ) ) {
				magicString.remove( match.index, match[0].length );
			}

			return {
				code: magicString.toString(),
				map: magicString.generateMap({ hires: true })
			};
		}
	};
}
