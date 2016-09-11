import { basename, extname } from 'path';
import { makeLegalIdentifier } from 'rollup-pluginutils';

export function getName ( id ) {
	return makeLegalIdentifier( basename( id, extname( id ) ) );
}

