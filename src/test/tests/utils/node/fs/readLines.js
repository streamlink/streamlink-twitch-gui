import { module, test } from "qunit";
import sinon from "sinon";
import { EventEmitter } from "events";

import readLinesInjector from "inject-loader?fs!utils/node/fs/readLines";


module( "utils/node/fs/readLines", {
	beforeEach() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "setTimeout", "clearTimeout" ],
			target: window
		});
	},
	afterEach() {
		this.fakeTimer.restore();
	}
});


test( "Invalid files", async function( assert ) {

	const error = new Error( "File not found" );
	const closeSpy = sinon.spy();
	const readStream = new EventEmitter();
	readStream.close = closeSpy;
	const createReadStreamStub = sinon.stub().returns( readStream );

	const { default: readLines } = readLinesInjector({
		fs: {
			createReadStream: createReadStreamStub
		}
	});

	await assert.rejects(
		async () => {
			const promise = readLines( "foo" );
			readStream.emit( "error", error );
			await promise;
		},
		error,
		"Rejects if file can't be read"
	);
	assert.ok( createReadStreamStub.calledWithExactly( "foo" ), "Reads the correct file" );
	assert.ok( closeSpy.calledOnce, "Calls readStream.close" );

});

test( "Timeout", async function( assert ) {

	const closeSpy = sinon.spy();
	const readStream = new EventEmitter();
	readStream.close = closeSpy;
	const createReadStreamStub = sinon.stub().returns( readStream );

	const { default: readLines } = readLinesInjector({
		fs: {
			createReadStream: createReadStreamStub
		}
	});

	await assert.rejects(
		async () => {
			const promise = readLines( "foo", null, 1, 1000 );
			this.fakeTimer.tick( 1000 );
			await promise;
		},
		new Error( "Timeout" ),
		"Rejects if read time has expired"
	);
	assert.ok( createReadStreamStub.calledWithExactly( "foo" ), "Reads the correct file" );
	assert.ok( closeSpy.calledOnce, "Calls readStream.close" );

});


test( "File validation", async assert => {

	const sandbox = sinon.createSandbox();

	const closeSpy = sandbox.spy();
	const readStream = new EventEmitter();
	readStream.close = closeSpy;
	const createReadStreamStub = sandbox.stub().returns( readStream );

	const { default: readLines } = readLinesInjector({
		fs: {
			createReadStream: createReadStreamStub
		}
	});

	try {
		const promise = readLines( "foo", /foo/ );
		readStream.emit( "data", "bar\n" );
		await promise;
	} catch ([ data, buffer ]) {
		assert.propEqual( data, [ null ], "Doesn't match the line" );
		assert.propEqual( buffer, [ "bar" ], "Returns the whole line buffer" );
	}
	assert.ok( createReadStreamStub.calledWithExactly( "foo" ), "Reads the correct file" );
	assert.ok( closeSpy.calledOnce, "Calls readStream.close" );

	sandbox.resetHistory();

	await ( async () => {
		const promise = readLines( "foo", /f(oo)/ );
		readStream.emit( "data", "foo\n" );
		const [ [ data ], buffer ] = await promise;
		assert.propEqual( data, [ "foo", "oo" ], "Matches the line" );
		assert.propEqual( buffer, [ "foo" ], "Returns the whole line buffer" );
		assert.ok( createReadStreamStub.calledWithExactly( "foo" ), "Reads the correct file" );
		assert.ok( closeSpy.calledOnce, "Calls readStream.close" );
	})();

	sandbox.resetHistory();

	await ( async () => {
		const promise = readLines( "foo" );
		readStream.emit( "data", "foo\n" );
		const [ [ data ], buffer ] = await promise;
		assert.propEqual( data, [ "foo" ], "Validates the line with default validation" );
		assert.propEqual( buffer, [ "foo" ], "Returns the whole line buffer" );
		assert.ok( createReadStreamStub.calledWithExactly( "foo" ), "Reads the correct file" );
		assert.ok( closeSpy.calledOnce, "Calls readStream.close" );
	})();

	sandbox.resetHistory();

	await ( async () => {
		const validation = ( line, index ) => {
			return index === 1
				? /bar/.exec( line )
				: false;
		};
		const promise = readLines( "foo", validation, 2 );
		readStream.emit( "data", "foo\n" );
		readStream.emit( "data", "bar\n" );
		readStream.emit( "data", "baz\n" );
		readStream.emit( "end" );
		const [ [ dataOne, dataTwo, dataThree ], buffer ] = await promise;
		assert.strictEqual( dataOne, false, "Doesn't match the first line" );
		assert.propEqual( dataTwo, [ "bar" ], "Matches the second line" );
		assert.strictEqual( dataThree, undefined, "Ignores the third line" );
		assert.propEqual( buffer, [ "foo", "bar" ], "Returns the whole line buffer" );
		assert.ok( createReadStreamStub.calledWithExactly( "foo" ), "Reads the correct file" );
		assert.ok( closeSpy.calledOnce, "Calls readStream.close" );
	})();

	sandbox.resetHistory();

	await ( async () => {
		const validation = ( line, index ) => {
			if ( index === 0 ) {
				return /foo/.exec( line );
			} else {
				return line.length === 3;
			}
		};
		const promise = readLines( "foo", validation, 2 );
		readStream.emit( "data", "foo\n" );
		readStream.emit( "data", "bar\n" );
		const [ [ dataOne, dataTwo ], buffer ] = await promise;
		assert.propEqual( dataOne, [ "foo" ], "Matches the first line" );
		assert.strictEqual( dataTwo, true, "Validates the second line" );
		assert.propEqual( buffer, [ "foo", "bar" ], "Returns the whole line buffer" );
		assert.ok( createReadStreamStub.calledWithExactly( "foo" ), "Reads the correct file" );
		assert.ok( closeSpy.calledOnce, "Calls readStream.close" );
	})();

	sandbox.resetHistory();

	await ( async () => {
		const promise = readLines( "foo", /foo/, 2 );
		readStream.emit( "data", "bar\nfoo\n" );
		const [ [ dataOne, dataTwo ], buffer ] = await promise;
		assert.strictEqual( dataOne, null, "Doesn't validate the first line" );
		assert.propEqual( dataTwo, [ "foo" ], "Validates the second line" );
		assert.propEqual( buffer, [ "bar", "foo" ], "Returns the whole line buffer" );
		assert.ok( createReadStreamStub.calledWithExactly( "foo" ), "Reads the correct file" );
		assert.ok( closeSpy.calledOnce, "Calls readStream.close" );
	})();

});
