import {
	module,
	test
} from "qunit";
import downloadInjector from "inject-loader?-url!utils/node/fs/download";
//import { EventEmitter } from "events";
import {
	posix as path
} from "path";
import {
	Readable,
	Writable
} from "stream";
import { parse } from "url";


module( "utils/node/fs/download" );


test( "Parameters", async assert => {

	const { default: download } = downloadInjector({
		path,
		"nwjs/Window": { window: {} },
		"utils/node/fs/mkdirp": () => {},
		"utils/node/http/getRedirected": () => {},
		"fs": {}
	});

	try {
		await download();
	} catch ( e ) {
		assert.strictEqual( e.message, "Invalid download URL", "Rejects on invalid url" );
	}

	try {
		await download( "foo" );
	} catch ( e ) {
		assert.strictEqual( e.message, "Invalid download URL", "Rejects on invalid url" );
	}

	try {
		await download({ protocol: "", host: "", pathname: "" });
	} catch ( e ) {
		assert.strictEqual( e.message, "Invalid download URL", "Rejects on invalid url" );
	}

	try {
		await download( "http://foo/bar" );
	} catch ( e ) {
		assert.strictEqual( e.message, "Invalid directory", "Rejects on invalid directory" );
	}

	try {
		await download( "http://foo/bar", "" );
	} catch ( e ) {
		assert.strictEqual( e.message, "Invalid directory", "Rejects on invalid directory" );
	}

	try {
		await download( "http://foo/bar", { dir: "" } );
	} catch ( e ) {
		assert.strictEqual( e.message, "Invalid directory", "Rejects on invalid directory" );
	}

});


test( "Download", async assert => {

	assert.expect( 52 );

	let url;
	let dest;
	let expectedUrl;
	let expectedDest;

	let readable;
	let writable;

	const { default: download } = downloadInjector({
		path,
		"nwjs/Window": {
			window: {
				setTimeout( callback, time ) {
					assert.step( "setTimeout" );
					assert.ok( callback instanceof Function, "Sets the timeout" );
					assert.strictEqual( time, 1000, "Sets the correct time" );
					callback();
					return 1234;
				},
				clearTimeout( time ) {
					assert.step( "clearTimeout" );
					assert.strictEqual( time, 1234, "Clears the correct timeout" );
				}
			}
		},
		"utils/node/fs/mkdirp": async path => {
			assert.strictEqual( path, "/foo/bar", "Tries to create download directory" );
			return path;
		},
		"utils/node/http/getRedirected": async url => {
			assert.propEqual( url, expectedUrl, "Calls getRedirected" );
			readable = new class extends Readable {
				constructor() {
					super( arguments );
					assert.step( "read create" );
				}
				_read() {}
				_destroy( err, callback ) {
					assert.step( "read end" );
					callback();
					readable = null;
				}
			}();
			return readable;
		},
		"fs": {
			WriteStream: class extends Writable {
				constructor( path ) {
					super( arguments );
					writable = this;
					assert.step( "write create" );
					assert.ok(
						expectedDest instanceof RegExp
							? expectedDest.test( path )
							: path === expectedDest,
						"Creates new WriteStream"
					);
				}
				_write( chunk, encoding, callback ) {
					assert.step( String( chunk ) );
					callback();
				}
				_destroy( err, callback ) {
					assert.step( "write end" );
					callback();
					writable = null;
				}
			}
		}
	});

	// explicit file name
	// write error

	url = "https://host/path";
	dest = { dir: "/foo/bar", name: "name" };
	expectedUrl = parse( url );
	expectedDest = "/foo/bar/name";

	try {
		const promise = download( url, dest );
		await new Promise( resolve => setTimeout( resolve, 10 ) );
		writable.emit( "error", new Error( "fail write" ) );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "fail write", "Rejects on write error" );
		assert.checkSteps(
			[
				"write create",
				"read create",
				"read end",
				"write end"
			],
			"Has the correct order of write and read stream events and method calls"
		);
	}

	// url basename as file name
	// read error

	url = "https://host/my/file";
	dest = "/foo/bar";
	expectedUrl = parse( url );
	expectedDest = "/foo/bar/file";

	try {
		const promise = download( url, dest );
		await new Promise( resolve => setTimeout( resolve, 10 ) );
		readable.emit( "error", new Error( "read write" ) );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "read write", "Rejects on read error" );
		assert.checkSteps(
			[
				"write create",
				"read create",
				"read end",
				"write end"
			],
			"Has the correct order of write and read stream events and method calls"
		);
	}

	// url basename as file name
	// timeout

	url = "https://host/my/file";
	dest = "/foo/bar";
	expectedUrl = parse( url );
	expectedDest = "/foo/bar/file";

	try {
		const promise = download( url, dest, 1000 );
		await new Promise( resolve => setTimeout( resolve, 10 ) );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "Timeout", "Rejects on timeout" );
		assert.checkSteps(
			[
				"write create",
				"read create",
				"setTimeout",
				"clearTimeout",
				"read end",
				"write end"
			],
			"Has the correct order of write and read stream events and method calls"
		);
	}

	// no file name and no url basename
	// unpipe

	url = "https://host/";
	dest = "/foo/bar";
	expectedUrl = parse( url );
	expectedDest = /^\/foo\/bar\/\d+\.download$/;

	try {
		const promise = download( url, dest );
		await new Promise( resolve => setTimeout( resolve, 10 ) );
		readable.emit( "unpipe" );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "I/O error", "Rejects on stream unpiping" );
		assert.checkSteps(
			[
				"write create",
				"read create",
				"read end",
				"write end"
			],
			"Has the correct order of write and read stream events and method calls"
		);
	}

	// url basename as file name
	// success

	url = "https://host/my/file";
	dest = "/foo/bar";
	expectedUrl = parse( url );
	expectedDest = "/foo/bar/file";

	try {
		const promise = download( expectedUrl, dest );
		await new Promise( resolve => setTimeout( resolve, 10 ) );
		readable.push( "foo" );
		readable.push( "bar" );
		readable.emit( "end" );
		const path = await promise;
		assert.strictEqual( path, expectedDest, "Resolves with correct path" );
		assert.checkSteps(
			[
				"write create",
				"read create",
				"foo",
				"bar",
				"read end",
				"write end"
			],
			"Has the correct order of write and read stream events and method calls"
		);
	} catch ( e ) {
		throw e;
	}

});
