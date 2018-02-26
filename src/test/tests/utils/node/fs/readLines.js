import { module, test } from "qunit";
import { EventEmitter } from "events";

import readLinesInjector from "inject-loader?fs!utils/node/fs/readLines";


module( "utils/node/fs/readLines" );


test( "Invalid files", async assert => {

	assert.expect( 3 );

	const readStream = new EventEmitter();
	readStream.close = () => {
		assert.ok( true, "Calls readStream.close" );
	};

	const readLines = readLinesInjector({
		fs: {
			createReadStream( path ) {
				assert.strictEqual( path, "foo", "Reads the correct file" );
				return readStream;
			}
		}
	})[ "default" ];

	let promise;

	try {
		promise = readLines( "foo" );
		readStream.emit( "error", new Error( "File not found" ) );
		await promise;
	} catch ( e ) {
		assert.strictEqual( e.message, "File not found", "Rejects if file can't be read" );
	}

});

test( "Timeout", async assert => {

	assert.expect( 2 );

	const readStream = new EventEmitter();
	readStream.close = () => {
		assert.ok( true, "Calls readStream.close" );
	};

	const readLines = readLinesInjector({
		fs: {
			createReadStream() {
				return readStream;
			}
		}
	})[ "default" ];

	try {
		await readLines( "foo", null, 1, 1 );
	} catch ( e ) {
		assert.strictEqual( e.message, "Timeout", "Rejects if read time has expired" );
	}

});


test( "File validation", async assert => {

	assert.expect( 21 );

	const readStream = new EventEmitter();
	readStream.close = () => {
		assert.ok( true, "Calls readStream.close" );
	};

	const readLines = readLinesInjector({
		fs: {
			createReadStream() {
				return readStream;
			}
		}
	})[ "default" ];

	let promise;

	try {
		promise = readLines( "foo", /foo/ );
		readStream.emit( "data", "bar\n" );
		await promise;
	} catch ([ data, buffer ]) {
		assert.deepEqual( data, [ null ], "Doesn't match the line" );
		assert.deepEqual( buffer, [ "bar" ], "Returns the whole line buffer" );
	}

	try {
		promise = readLines( "foo", /f(oo)/ );
		readStream.emit( "data", "foo\n" );
		const [ [ data ], buffer ] = await promise;
		assert.deepEqual( data, [ "foo", "oo" ], "Matches the line" );
		assert.deepEqual( buffer, [ "foo" ], "Returns the whole line buffer" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

	try {
		promise = readLines( "foo", line => line.length === 3 );
		readStream.emit( "data", "foo\n" );
		const [ [ data ], buffer ] = await promise;
		assert.strictEqual( data, true, "Validates the line" );
		assert.deepEqual( buffer, [ "foo" ], "Returns the whole line buffer" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

	try {
		const validation = ( line, index ) => {
			if ( index === 0 ) {
				return /foo/.exec( line );
			} else {
				return line.length === 3;
			}
		};
		promise = readLines( "foo", validation );
		readStream.emit( "data", "foo\n" );
		readStream.emit( "data", "bar\n" );
		const [ [ dataOne, dataTwo ], buffer ] = await promise;
		assert.deepEqual( dataOne, [ "foo" ], "Matches the first line" );
		assert.strictEqual( dataTwo, undefined, "Ignores the second line" );
		assert.deepEqual( buffer, [ "foo" ], "Returns the line buffer with just one line" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

	try {
		const validation = ( line, index ) => {
			if ( index === 0 ) {
				return /foo/.exec( line );
			} else {
				return line.length === 3;
			}
		};
		promise = readLines( "foo", validation, 2 );
		readStream.emit( "data", "foo\n" );
		readStream.emit( "data", "bar\n" );
		const [ [ dataOne, dataTwo ], buffer ] = await promise;
		assert.deepEqual( dataOne, [ "foo" ], "Matches the first line" );
		assert.strictEqual( dataTwo, true, "Validates the second line" );
		assert.deepEqual( buffer, [ "foo", "bar" ], "Returns the whole line buffer" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

	try {
		promise = readLines( "foo", /foo/, 2 );
		readStream.emit( "data", "bar\nfoo\n" );
		const [ [ dataOne, dataTwo ], buffer ] = await promise;
		assert.strictEqual( dataOne, null, "Doesn't validate the first line" );
		assert.deepEqual( dataTwo, [ "foo" ], "Validates the second line" );
		assert.deepEqual( buffer, [ "bar", "foo" ], "Returns the whole line buffer" );
	} catch ( e ) {
		assert.ok( false, "Doesn't reject" );
	}

});
