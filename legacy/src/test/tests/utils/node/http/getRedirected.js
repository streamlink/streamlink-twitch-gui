import { module, test } from "qunit";
import { EventEmitter } from "events";

import getRedirectedInjector from "inject-loader?http&https!utils/node/http/getRedirected";


class FakeServerResponse {
	constructor( code, location ) {
		this.statusCode = code;
		this.headers = { location };
	}
}

class FakeClientRequest extends EventEmitter {
	constructor( response, callback ) {
		super();
		Promise.resolve()
			.then( () => callback( response ) );
	}
}


module( "utils/node/http/getRedirected" );


test( "Redirections", async assert => {

	assert.expect( 10 );

	let response;

	function get( url, callback ) {
		let request;

		switch ( url ) {
			case "http://localhost/foo":
				assert.ok( true, "Calls get with the correct first URL" );
				return new FakeClientRequest(
					new FakeServerResponse( 300, "https://localhost/bar" ),
					callback
				);

			case "https://localhost/bar":
				assert.ok( true, "Calls get with the correct second absolute redirection URL" );
				return new FakeClientRequest(
					new FakeServerResponse( 300, "/baz" ),
					callback
				);

			case "https://localhost/baz":
				assert.ok( true, "Calls get with the correct third relative redirection URL" );
				return new FakeClientRequest(
					new FakeServerResponse( 200 ),
					callback
				);

			case "http://localhost/qux":
				assert.ok( true, "Calls get with the correct server error URL" );
				return new FakeClientRequest(
					new FakeServerResponse( 500 ),
					callback
				);

			default:
				request = new FakeClientRequest(
					new FakeServerResponse(),
					() => {
						request.emit( "error", new Error( "Connection error" ) );
					}
				);
				return request;
		}
	}

	const { default: getRedirected } = getRedirectedInjector({
		http: { get },
		https: { get }
	});

	response = await getRedirected( "http://localhost/foo", 3 );
	assert.strictEqual(
		response.statusCode,
		200,
		"Returns the last server response object"
	);

	try {
		await getRedirected( "http://localhost/foo", 1 );
	} catch ( err ) {
		assert.strictEqual(
			err.toString(),
			"Error: Maximum number of redirects reached",
			"Rejects when maximum number of redirections has been reached"
		);
	}

	try {
		await getRedirected( "http://localhost/qux", 1 );
	} catch ( err ) {
		assert.strictEqual(
			err.toString(),
			"Error: HTTP Error: 500",
			"Rejects on server errors"
		);
	}

	try {
		await getRedirected( "http://foo", 3 );
	} catch ( err ) {
		assert.strictEqual(
			err.toString(),
			"Error: Connection error",
			"Rejects on connection errors"
		);
	}

});
