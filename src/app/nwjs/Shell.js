import { Shell } from "nwjs/nwGui";


const { openExternal } = Shell;

const reVariable = /{(\w+)}/g;


/**
 * @param {String} url
 * @param {Object<String,String>?} vars
 * @returns {Promise}
 */
export function openBrowser( url, vars ) {
	return new Promise( ( resolve, reject ) => {
		if ( !url ) {
			return reject( new Error( "Missing URL" ) );
		}

		const hasVars = vars instanceof Object;

		url = url.replace( reVariable, ( _, name ) => {
			if ( !hasVars || !vars.hasOwnProperty( name ) ) {
				throw new Error( `Missing value for key '${name}'` );
			}

			return vars[ name ];
		});

		openExternal( url );

		resolve( url );
	});
}
