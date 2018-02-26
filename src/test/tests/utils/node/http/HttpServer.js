import { module, test } from "qunit";
import { EventEmitter } from "events";

import httpServerInjector from "inject-loader?http!utils/node/http/HttpServer";


class FakeHttpServer extends EventEmitter {
	constructor() {
		super();
	}

	setTimeout( timeout ) {
		this.timeout = timeout;
	}

	listen( port, callback ) {
		this.port = port;
		callback();
	}

	close() {
		this.emit( "close" );
	}
}

class FakeHttpRequest {
	constructor( method, url ) {
		this.method = method;
		this.url = url;
	}
}

class FakeHttpResponse {
	constructor() {
		this.statusCode = 200;
	}

	end( message ) {
		this.message = message;
		this.ended = true;
	}
}

const HttpServer = httpServerInjector({
	http: {
		createServer() {
			return new FakeHttpServer();
		}
	}
})[ "default" ];


module( "utils/node/http/HttpServer" );


test( "Setup and shutdown", assert => {

	const server = new HttpServer( 8000 );

	assert.ok( server.server instanceof FakeHttpServer, "Sets up the node http server" );
	assert.strictEqual( server.server.port, 8000, "Sets the correct server port" );
	assert.strictEqual( server.routes.length, 0, "Doesn't have any routes initially" );

	server.close();
	assert.strictEqual( server.server, null, "Server has been shut down" );
	assert.strictEqual( server.routes, null, "All routes have been removed from memory" );

});


test( "Route matching", assert => {

	assert.expect( 11 );

	const server = new HttpServer( 8000 );
	let requestFoo = new FakeHttpRequest( "GET", "/foo" );
	let responseFoo = new FakeHttpResponse();
	let requestBaz = new FakeHttpRequest( "GET", "/baz/baz/baz" );
	let responseBaz = new FakeHttpResponse();
	let requestQux = new FakeHttpRequest( "GET", "/qux" );
	let responseQux = new FakeHttpResponse();

	server.onRequest( "GET", "/bar", () => {
		assert.ok( false, "Will never call the GET /bar route callback" );
	});

	server.onRequest( "POST", "/foo", () => {
		assert.ok( false, "Will never call the POST /foo route callback" );
	});

	server.onRequest( "GET", "/foo", ( req, res ) => {
		assert.ok( true, "Has called the first GET /foo route callback" );
		assert.strictEqual( req, requestFoo, "Passes the correct request object" );
		assert.strictEqual( res, responseFoo, "Passes the correct response object" );
	});

	server.onRequest( "GET", "/foo", ( req, res ) => {
		assert.ok( true, "Has called the second GET /foo route callback" );
		assert.strictEqual( req, requestFoo, "Passes the correct request object" );
		assert.strictEqual( res, responseFoo, "Passes the correct response object" );
		return true;
	});

	server.onRequest( "GET", "/foo", () => {
		assert.ok( false, "Will never call the third GET /foo route callback" );
	});

	server.onRequest( "GET", "/foo", () => {
		assert.ok( false, "Will never call the third GET /foo route callback" );
	});

	server.onRequest( "GET", /\/baz.+/, ( req, res ) => {
		assert.ok( true, "Matches regexp routes" );
		assert.strictEqual( req, requestBaz, "Passes the correct request object" );
		assert.strictEqual( res, responseBaz, "Passes the correct response object" );
	});

	server.server.emit( "request", requestFoo, responseFoo );
	server.server.emit( "request", requestQux, responseQux );
	server.server.emit( "request", requestBaz, responseBaz );

	assert.strictEqual( responseQux.statusCode, 404, "Returns 404 code on unmatched routes" );
	assert.strictEqual( responseQux.message, "404", "Writes 404 message on unmatched routes" );

});
