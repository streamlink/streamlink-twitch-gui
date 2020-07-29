import { module, test } from "qunit";
import sinon from "sinon";
import { EventEmitter } from "events";

import httpServerInjector from "inject-loader?http!utils/node/http/HttpServer";
import { Stream, Writable } from "stream";


module( "utils/node/http/HttpServer", function() {
	class FakeHttpServer extends EventEmitter {
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

	class FakeIncomingMessage extends Stream {
		constructor( method, url ) {
			super();
			this.method = method;
			this.url = url;
		}
	}

	class FakeServerResponse extends Writable {
		content = "";
		statusCode = 200;

		_write( chunk, encoding, callback ) {
			this.content += chunk.toString();
			callback();
		}

		_final( callback ) {
			callback();
		}
	}

	const { default: HttpServer } = httpServerInjector({
		http: {
			createServer: () => new FakeHttpServer()
		}
	});


	test( "Setup and shutdown", function( assert ) {
		const server = new HttpServer( 8000 );

		assert.ok( server.server instanceof FakeHttpServer, "Sets up the node http server" );
		assert.strictEqual( server.server.port, 8000, "Sets the correct server port" );
		assert.strictEqual( server.routes.length, 0, "Doesn't have any routes initially" );

		server.close();
		assert.strictEqual( server.server, null, "Server has been shut down" );
		assert.strictEqual( server.routes, null, "All routes have been removed from memory" );
	});

	test( "Request event", async function( assert ) {
		const server = new HttpServer( 8000 );
		const handleRequestSpy = sinon.spy( server, "handleRequest" );

		const request = new FakeIncomingMessage( "GET", "/foo" );
		const response = new FakeServerResponse();
		server.server.emit( "request", request, response );

		assert.strictEqual(
			await handleRequestSpy.returnValues[0],
			response,
			"Properly handles requests"
		);
	});

	test( "Route matching", async function( assert ) {
		const server = new HttpServer( 8000 );
		const requestFoo = new FakeIncomingMessage( "GET", "/foo" );
		const responseFoo = new FakeServerResponse();
		const requestBaz = new FakeIncomingMessage( "GET", "/baz/baz/baz" );
		const responseBaz = new FakeServerResponse();
		const requestQux = new FakeIncomingMessage( "GET", "/qux" );
		const responseQux = new FakeServerResponse();

		const requestGetBarSpy = sinon.spy();
		const requestPostFooSpy = sinon.spy();
		const requestGetFooOneStub = sinon.stub().resolves( undefined );
		const requestGetFooTwoStub = sinon.stub().resolves( true );
		const requestGetFooThreeSpy = sinon.spy();
		const requestGetBazStub = sinon.stub().callsFake( ( req, res ) => res.end( "baz" ) );

		server.onRequest( "GET", "/bar", requestGetBarSpy );
		server.onRequest( "POST", "/foo", requestPostFooSpy );
		server.onRequest( "GET", "/foo", requestGetFooOneStub );
		server.onRequest( "GET", "/foo", requestGetFooTwoStub );
		server.onRequest( "GET", "/foo", requestGetFooThreeSpy );
		server.onRequest( "GET", /\/baz.+/, requestGetBazStub );

		await server.handleRequest( requestFoo, responseFoo );
		await server.handleRequest( requestQux, responseQux );
		await server.handleRequest( requestBaz, responseBaz );
		await new Promise( resolve => process.nextTick( resolve ) );

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
		assert.notOk(
			requestGetFooThreeSpy.called,
			"Never calls the third GET /foo route callback"
		);
		assert.ok(
			requestGetBazStub.calledWithExactly( requestBaz, responseBaz ),
			"Matches regexp routes"
		);
		assert.notOk( responseFoo.writable, "/foo response stream has ended" );
		assert.notOk( responseQux.writable, "/qux response stream has ended" );
		assert.notOk( responseBaz.writable, "/baz response stream has ended" );

		assert.strictEqual( responseQux.statusCode, 404, "Returns 404 code on unmatched routes" );
		assert.strictEqual( responseQux.content, "404", "Writes 404 message on unmatched routes" );
		assert.strictEqual( responseBaz.content, "baz", "Baz response has correct content" );
	});
});
