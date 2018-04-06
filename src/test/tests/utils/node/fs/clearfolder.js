import { module, test } from "qunit";
import sinon from "sinon";

import clearfolderInjector from "inject-loader?-util!utils/node/fs/clearfolder";
import { posix as path } from "path";


module( "utils/node/fs/clearfolder", {
	beforeEach() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date" ],
			target: window
		});

		this.statStub = sinon.stub();
		this.fsReaddirStub = sinon.stub();
		this.fsUnlinkStub = sinon.stub();

		this.subject = () => clearfolderInjector({
			"utils/node/fs/stat": {
				isFile: stats => stats.isFile(),
				stat: this.statStub
			},
			path,
			fs: {
				readdir: this.fsReaddirStub,
				unlink: this.fsUnlinkStub
			}
		})[ "default" ];
	},
	afterEach() {
		this.fakeTimer.restore();
	}
});


test( "Invalid directory", async function( assert ) {

	const error = new Error( "readdir failure" );
	const clearfolder = this.subject();

	this.fsReaddirStub.callsFake( ( path, callback ) => callback( error ) );

	await assert.rejects( clearfolder( "/foo" ), error, "Rejects on invalid directory" );
	assert.ok( this.fsReaddirStub.calledWith( "/foo" ), "Reads the correct directory" );
	assert.notOk( this.statStub.called, "Doesn't check any files on invalid directory" );
	assert.notOk( this.fsUnlinkStub.called, "Doesn't delete any files on invalid directory" );

});


test( "All files", async function( assert ) {

	const clearfolder = this.subject();

	this.statStub.callsFake( async ( file, check ) => {
		const stats = {
			isFile() {
				// bar is not a file
				return file !== "/dir/bar";
			}
		};

		if ( !check( stats ) ) {
			throw new Error( `${file} is not a file` );
		}

		return file;
	});
	this.fsReaddirStub.callsFake( ( path, callback ) => callback( null, [
		"foo",
		"bar",
		"baz",
		"qux"
	]) );
	this.fsUnlinkStub.callsFake( ( path, callback ) => {
		// let the deletion of /dir/baz fail
		if ( path === "/dir/baz" ) {
			callback( new Error( "Can't delete /dir/baz" ) );
		} else {
			callback( null, path );
		}
	});

	assert.propEqual(
		await clearfolder( "/dir" ),
		[ "/dir/foo", "/dir/qux" ],
		"Deletes all files"
	);
	assert.ok( this.fsReaddirStub.calledWith( "/dir" ), "Reads the correct directory" );
	assert.propEqual(
		this.statStub.args.map( args => args[0] ),
		[ "/dir/foo", "/dir/bar", "/dir/baz", "/dir/qux" ],
		"Checks all potential files"
	);
	assert.propEqual(
		this.fsUnlinkStub.args.map( args => args[0] ),
		[ "/dir/foo", "/dir/baz", "/dir/qux" ],
		"Tries to delete all files"
	);

});


test( "File age threshold", async function( assert ) {

	const threshold = 100;
	const clearfolder = this.subject();

	this.fakeTimer.setSystemTime( 1000 );

	this.statStub.callsFake( async ( file, check ) => {
		const stats = {
			mtime: file === "/dir/foo"
				// foo is newer than X (don't delete)
				? Date.now() - ( threshold / 2 )
				// bar, baz and qux are older than X (delete)
				: Date.now() - ( threshold * 2 ),
			isFile() {
				// bar is not a file
				return file !== "/dir/bar";
			}
		};

		if ( !check( stats ) ) {
			throw new Error( `${file} is not a file or doesn't match criteria` );
		}

		return file;
	});
	this.fsReaddirStub.callsFake( ( path, callback ) => callback( null, [
		"foo",
		"bar",
		"baz",
		"qux"
	]) );
	this.fsUnlinkStub.callsFake( ( path, callback ) => {
		// let the deletion of /dir/baz fail
		if ( path === "/dir/baz" ) {
			callback( new Error( "Can't delete /dir/baz" ) );
		} else {
			callback( null, path );
		}
	});

	assert.propEqual(
		await clearfolder( "/dir", threshold ),
		[ "/dir/qux" ],
		"Deletes files not newer than X and ignores failed attempts"
	);
	assert.ok( this.fsReaddirStub.calledWith( "/dir" ), "Reads the correct directory" );
	assert.propEqual(
		this.statStub.args.map( args => args[0] ),
		[ "/dir/foo", "/dir/bar", "/dir/baz", "/dir/qux" ],
		"Checks all files"
	);
	assert.propEqual(
		this.fsUnlinkStub.args.map( args => args[0] ),
		[ "/dir/baz", "/dir/qux" ],
		"Tries to delete all files"
	);

});
