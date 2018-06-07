import { module, test } from "qunit";
import sinon from "sinon";

import downloadInjector from "inject-loader?-url!utils/node/fs/download";
import { posix as path } from "path";
import { Readable, Writable } from "stream";
import { parse } from "url";


module( "utils/node/fs/download", {
	beforeEach() {
		const self = this;
		this.readable = null;
		this.writable = null;

		class ReadStream extends Readable {
			_read() {}
			_destroy( err, callback ) {
				callback();
				self.readable = null;
			}
		}

		class WriteStream extends Writable {
			_write( chunk, encoding, callback ) {
				callback();
			}
			_destroy( err, callback ) {
				callback();
				self.writable = null;
			}
		}

		this.mkdirpStub = sinon.stub();

		this.setTimeoutStub = sinon.stub().callsFake( callback => {
			process.nextTick( callback );
			return 1234;
		});
		this.clearTimeoutSpy = sinon.spy();

		this.readableStub = sinon.stub().callsFake( ( ...args ) =>
			this.readable = new ReadStream( ...args )
		);
		this.readableDestroySpy = sinon.spy( ReadStream.prototype, "_destroy" );

		this.writableStub = sinon.stub().callsFake( ( ...args ) =>
			this.writable = new WriteStream( ...args )
		);
		this.writableWriteSpy = sinon.spy( WriteStream.prototype, "_write" );

		this.subject = () => downloadInjector({
			path,
			"utils/node/fs/mkdirp": this.mkdirpStub,
			"utils/node/http/getRedirected": this.readableStub,
			"fs": {
				WriteStream: this.writableStub
			},
			"timers": {
				setTimeout: this.setTimeoutStub,
				clearTimeout: this.clearTimeoutSpy
			}
		})[ "default" ];
	}
});


test( "Parameters", async function( assert ) {

	const download = this.subject();

	await assert.rejects(
		download(),
		new Error( "Invalid download URL" ),
		"Rejects on invalid URL"
	);

	await assert.rejects(
		download( "foo" ),
		new Error( "Invalid download URL" ),
		"Rejects on invalid URL"
	);

	await assert.rejects(
		download({ protocol: "", host: "", pathname: "" }),
		new Error( "Invalid download URL" ),
		"Rejects on invalid URL"
	);

	await assert.rejects(
		download( "http://foo/bar", "" ),
		new Error( "Invalid directory" ),
		"Rejects on invalid directory"
	);

	await assert.rejects(
		download( "http://foo/bar" ),
		new Error( "Invalid directory" ),
		"Rejects on invalid directory"
	);

	await assert.rejects(
		download( "http://foo/bar", { dir: "" } ),
		new Error( "Invalid directory" ),
		"Rejects on invalid directory"
	);

	assert.notOk( this.mkdirpStub.called, "Doesn't create download directory" );
	assert.notOk( this.writableStub.called, "Doesn't create WriteStream" );
	assert.notOk( this.readableStub.called, "Doesn't create ReadStream" );
	assert.notOk( this.setTimeoutStub.called, "Doesn't set timeout" );

});


test( "Write error", async function( assert ) {

	const error = new Error( "write error" );
	const download = this.subject();

	// explicit dest
	const promise = download( "https://host/path", { dir: "/foo/bar", name: "name" } );
	await new Promise( resolve => process.nextTick( resolve ) );

	assert.propEqual( this.mkdirpStub.args, [[ "/foo/bar" ]], "Creates download directory" );
	assert.propEqual( this.writableStub.args, [[ "/foo/bar/name" ]], "Creates new WriteStream" );
	assert.propEqual(
		this.readableStub.args,
		[[ parse( "https://host/path" ) ]],
		"Creates new ReadStream"
	);
	assert.ok(
		this.writableStub.calledBefore( this.readableStub ),
		"Creates WriteStream before ReadStream"
	);
	assert.notOk( this.setTimeoutStub.called, "Doesn't set a timeout callback if time is not set" );
	assert.notOk( this.readableDestroySpy.called, "Hasn't called readable.destory yet" );

	this.writable.emit( "error", error );

	await assert.rejects( promise, error, "Rejects on write error" );

	assert.notOk( this.writableWriteSpy.called, "Doesn't write on error" );
	assert.notOk( this.clearTimeoutSpy.called, "Doesn't call clearTimeout" );
	assert.ok( this.readableDestroySpy.calledOnce, "Has called readable.destory" );

});


test( "Read error", async function( assert ) {

	const error = new Error( "read error" );
	const download = this.subject();

	// url basename as file name
	const promise = download( "https://host/my/file", "/foo/bar" );
	await new Promise( resolve => process.nextTick( resolve ) );

	assert.propEqual( this.mkdirpStub.args, [[ "/foo/bar" ]], "Creates download directory" );
	assert.propEqual( this.writableStub.args, [[ "/foo/bar/file" ]], "Creates new WriteStream" );
	assert.propEqual(
		this.readableStub.args,
		[[ parse( "https://host/my/file" ) ]],
		"Creates new ReadStream"
	);
	assert.ok(
		this.writableStub.calledBefore( this.readableStub ),
		"Creates WriteStream before ReadStream"
	);
	assert.notOk( this.setTimeoutStub.called, "Doesn't set a timeout callback if time is not set" );
	assert.notOk( this.readableDestroySpy.called, "Hasn't called readable.destory yet" );

	this.readable.emit( "error", error );

	await assert.rejects( promise, error, "Rejects on read error" );

	assert.notOk( this.writableWriteSpy.called, "Doesn't write on error" );
	assert.notOk( this.clearTimeoutSpy.called, "Doesn't call clearTimeout" );
	assert.ok( this.readableDestroySpy.calledOnce, "Has called readable.destory" );

});


test( "Timeout", async function( assert ) {

	const download = this.subject();

	// url basename as file name
	const promise = download( "https://host/my/file", "/foo/bar", 1000 );
	await new Promise( resolve => process.nextTick( resolve ) );

	assert.propEqual( this.mkdirpStub.args, [[ "/foo/bar" ]], "Creates download directory" );
	assert.propEqual( this.writableStub.args, [[ "/foo/bar/file" ]], "Creates new WriteStream" );
	assert.propEqual(
		this.readableStub.args,
		[[ parse( "https://host/my/file" ) ]],
		"Creates new ReadStream"
	);
	assert.propEqual(
		this.setTimeoutStub.args,
		[[ new Function(), 1000 ]],
		"Sets timeout if time parameter is set"
	);
	assert.ok(
		this.writableStub.calledBefore( this.readableStub ),
		"Creates WriteStream before ReadStream"
	);
	assert.ok(
		this.setTimeoutStub.calledAfter( this.readableStub ),
		"Sets timeout after creating ReadStream"
	);
	assert.notOk( this.readableDestroySpy.called, "Hasn't called readable.destory yet" );

	await assert.rejects( promise, new Error( "Timeout" ), "Rejects on timeout" );

	assert.notOk( this.writableWriteSpy.called, "Doesn't write on error" );
	assert.propEqual( this.clearTimeoutSpy.args, [[ 1234 ]], "Clears timeout" );
	assert.ok( this.readableDestroySpy.calledOnce, "Has called readable.destory" );
	assert.ok(
		this.clearTimeoutSpy.calledBefore( this.readableDestroySpy ),
		"Clears timeout before destroying ReadStream"
	);

});


test( "Unpipe", async function( assert ) {

	const error = new Error( "I/O error" );
	const expectedDest = /^\/foo\/bar\/\d+\.download$/;

	const download = this.subject();

	// no file name and no url basename
	const promise = download( "https://host/", "/foo/bar" );
	await new Promise( resolve => process.nextTick( resolve ) );

	assert.propEqual( this.mkdirpStub.args, [[ "/foo/bar" ]], "Creates download directory" );
	assert.ok( expectedDest.test( this.writableStub.args[0][0] ), "Creates new WriteStream" );
	assert.propEqual(
		this.readableStub.args,
		[[ parse( "https://host/" ) ]],
		"Creates new ReadStream"
	);
	assert.ok(
		this.writableStub.calledBefore( this.readableStub ),
		"Creates WriteStream before ReadStream"
	);
	assert.notOk( this.setTimeoutStub.called, "Doesn't set a timeout callback if time is not set" );
	assert.notOk( this.readableDestroySpy.called, "Hasn't called readable.destory yet" );

	this.readable.emit( "unpipe" );

	await assert.rejects( promise, error, "Rejects on stream unpiping" );

	assert.notOk( this.writableWriteSpy.called, "Doesn't write on error" );
	assert.notOk( this.clearTimeoutSpy.called, "Doesn't call clearTimeout" );
	assert.ok( this.readableDestroySpy.calledOnce, "Has called readable.destory" );

});


test( "Download", async function( assert ) {

	const download = this.subject();

	// url basename as file name
	const promise = download( "https://host/my/file", "/foo/bar" );
	await new Promise( resolve => process.nextTick( resolve ) );

	assert.propEqual( this.mkdirpStub.args, [[ "/foo/bar" ]], "Creates download directory" );
	assert.propEqual( this.writableStub.args, [[ "/foo/bar/file" ]], "Creates new WriteStream" );
	assert.propEqual(
		this.readableStub.args,
		[[ parse( "https://host/my/file" ) ]],
		"Creates new ReadStream"
	);
	assert.ok(
		this.writableStub.calledBefore( this.readableStub ),
		"Creates WriteStream before ReadStream"
	);
	assert.notOk( this.setTimeoutStub.called, "Doesn't set a timeout callback if time is not set" );
	assert.notOk( this.readableDestroySpy.called, "Hasn't called readable.destory yet" );

	this.readable.push( "foo" );
	this.readable.push( "bar" );
	this.readable.emit( "end" );

	await promise;

	assert.propEqual(
		this.writableWriteSpy.args.map( args => String( args[0] ) ),
		[ "foo", "bar" ],
		"Writes all stream chunks"
	);
	assert.notOk( this.clearTimeoutSpy.called, "Doesn't call clearTimeout" );
	assert.ok( this.readableDestroySpy.calledOnce, "Has called readable.destory" );
	assert.ok(
		this.writableWriteSpy.calledBefore( this.readableDestroySpy ),
		"Writes all stream chunks before destroying the ReadStream"
	);

});
