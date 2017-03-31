import { createServer } from "http";
import { parse } from "url";


/**
 * @class HttpServerRoute
 */
class HttpServerRoute {
	/**
	 * @param {String} method
	 * @param {(String|RegExp)} url
	 * @param {Function} callback
	 */
	constructor( method, url, callback ) {
		this.method = method;
		this.url = url;
		this.isRegExp = url instanceof RegExp;
		this.callback = callback;
	}

	matches( request ) {
		return this.method === request.method
			&& ( this.isRegExp
				? this.url.test( request.url.pathname )
				: this.url === request.url.pathname
			);
	}
}


/**
 * @class HttpServer
 * @property {HttpServerRoute[]} routes
 * @property {http.Server} server
 */
export default class HttpServer {
	/**
	 * @param {Number} port
	 * @param {Number?} timeout
	 */
	constructor( port, timeout ) {
		this.routes = [];

		this.server = createServer();
		this.server.setTimeout( timeout || 120000 );
		this.server.listen( port, () => {
			this.server.on( "request", ( ...args ) => this.handleRequest( ...args ) );
		});
		this.server.on( "close", () => {
			this.routes = null;
			this.server = null;
		});
	}

	handleRequest( request, response ) {
		let matched = false;

		// parse url
		request.url = parse( request.url, true );

		this.routes.some( route => {
			// next route
			if ( !route.matches( request ) ) { return false; }
			matched = true;

			// last route
			const result = route.callback( request, response );
			if ( result === true ) {
				return true;
			}
		});

		// no route matched
		if ( !matched ) {
			response.statusCode = 404;
			response.end( "404" );
		}
	}

	/**
	 * @param {String} method
	 * @param {(String|RegExp)} url
	 * @param {Function} callback
	 */
	onRequest( method, url, callback ) {
		this.routes.push( new HttpServerRoute( method, url, callback ) );
	}

	close() {
		this.server.close();
	}
}
