import { module, test } from "qunit";
import sinon from "sinon";
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

	const server = new HttpServer( 8000 );
	const requestFoo = new FakeHttpRequest( "GET", "/foo" );
	const responseFoo = new FakeHttpResponse();
	const requestBaz = new FakeHttpRequest( "GET", "/baz/baz/baz" );
	const responseBaz = new FakeHttpResponse();
	const requestQux = new FakeHttpRequest( "GET", "/qux" );
	const responseQux = new FakeHttpResponse();

	const requestGetBarSpy = sinon.spy();
	const requestPostFooSpy = sinon.spy();
	const requestGetFooOneStub = sinon.stub().returns( undefined );
	const requestGetFooTwoStub = sinon.stub().returns( true );
	const requestGetFooThreeSpy = sinon.spy();
	const requestGetBazSpy = sinon.spy();

	server.onRequest( "GET", "/bar", requestGetBarSpy );
	server.onRequest( "POST", "/foo", requestPostFooSpy );
	server.onRequest( "GET", "/foo", requestGetFooOneStub );
	server.onRequest( "GET", "/foo", requestGetFooTwoStub );
	server.onRequest( "GET", "/foo", requestGetFooThreeSpy );
	server.onRequest( "GET", /\/baz.+/, requestGetBazSpy );

	server.server.emit( "request", requestFoo, responseFoo );
	server.server.emit( "request", requestQux, responseQux );
	server.server.emit( "request", requestBaz, responseBaz );

	assert.notOk( requestGetBarSpy.called, "Will never call the GET /bar route callback" );
	assert.notOk( requestPostFooSpy.called, "Will never call the POST /foo route callback" );
	assert.ok(
		requestGetFooOneStub.calledWithExactly( requestFoo, responseFoo ),
		"Has called the first GET /foo route callback"
	);
	assert.ok(
		requestGetFooTwoStub.calledWithExactly( requestFoo, responseFoo ),
		"Has called the second GET /foo route callback"
	);
	assert.notOk( requestGetFooThreeSpy.called, "Never calls the third GET /foo route callback" );
	assert.ok(
		requestGetBazSpy.calledWithExactly( requestBaz, responseBaz ),
		"Matches regexp routes"
	);

	assert.strictEqual( responseQux.statusCode, 404, "Returns 404 code on unmatched routes" );
	assert.strictEqual( responseQux.message, "404", "Writes 404 message on unmatched routes" );

});
