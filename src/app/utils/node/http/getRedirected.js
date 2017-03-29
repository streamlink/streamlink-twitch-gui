import { get as httpGet } from "http";
import { get as httpsGet } from "https";
import {
	parse as urlParse,
	format as urlFormat
} from "url";


const MAX_REDIRECTS = 3;


class Redirection {
	constructor( dest ) {
		if ( !dest ) {
			throw new Error( "Missing location header" );
		}

		this.dest = dest;
	}
}


function mergeURLs( a, b ) {
	let parsedB = urlParse( a );
	// do nothing if second URL contains host
	if ( parsedB.host ) { return b; }

	// take first URL's protocol and host and apply it to the second one
	let parsedA = urlParse( a );

	parsedB.protocol = parsedA.protocol;
	parsedB.auth = parsedA.auth;
	parsedB.host = parsedA.host;

	return urlFormat( parsedB );
}

function promiseRequest( url ) {
	return new Promise( ( resolve, reject ) => {
		// detect protocol
		const get = urlParse( url ).protocol === "https:"
			? httpsGet
			: httpGet;

		// send a GET request
		get( url, res => {
			let status = res.statusCode;

			if ( status >= 300 && status < 400 ) {
				// redirection
				reject( new Redirection( res.headers.location ) );

			} else if ( status !== 200 ) {
				// error
				reject( new Error( `HTTP Error: ${status}` ) );

			} else {
				// success
				resolve( res );
			}
		})
			.on( "error", reject );
	});
}

function doRequest( url, num ) {
	return promiseRequest( url )
		.catch( data => {
			if ( !( data instanceof Redirection ) ) {
				// error
				return Promise.reject( data );

			} else if ( num > MAX_REDIRECTS ) {
				// too many redirects
				return Promise.reject( new Error( "Maximum number of redirects reached" ) );

			} else {
				// add current host to url if it's a relative one
				url = mergeURLs( url, data.dest );
				// try again with new url
				return doRequest( url, ++num );
			}
		});
}


function getRedirected( url ) {
	return doRequest( url, 1 );
}


export default getRedirected;
