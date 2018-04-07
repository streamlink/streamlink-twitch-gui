import { module, test } from "qunit";
import sinon from "sinon";
import { R_OK, W_OK } from "fs";
import { posix as path } from "path";

import mkdirpInjector from "inject-loader?-util!utils/node/fs/mkdirp";


module( "utils/node/fs/mkdirp", {
	beforeEach() {
		this.statStub = sinon.stub();
		this.fsMkdirStub = sinon.stub();

		this.subject = isWin => mkdirpInjector({
			"utils/node/platform": {
				isWin: !!isWin
			},
			"utils/node/fs/stat": {
				isDirectory: stats => stats.isDirectory(),
				stat: this.statStub
			},
			path,
			fs: {
				W_OK,
				mkdir: this.fsMkdirStub
			}
		});
	}
});


test( "No directory", async function( assert ) {

	const errorMkdir = new Error( "mkdir fail" );
	const errorStat = new Error( "stat fail" );

	const { default: mkdirp } = this.subject();

	this.statStub.rejects( errorStat );
	this.fsMkdirStub.callsFake( ( dir, callback ) => callback( errorMkdir ) );

	await assert.rejects( mkdirp( "/foo/bar" ), errorStat, "Rejects on existing file" );
	assert.ok( this.fsMkdirStub.calledWith( "/foo/bar" ), "/foo/bar", "Tries to create directory" );
	assert.ok( this.statStub.calledWith( "/foo/bar" ), "Tries to validate directory" );

});


test( "Already existing directory", async function( assert ) {

	const error = new Error();
	error.code = "EEXIST";

	const { default: mkdirp } = this.subject();

	this.fsMkdirStub.callsFake( ( dir, callback ) => callback( error ) );

	const dir = await mkdirp( "/foo/bar" );
	assert.strictEqual( dir, "/foo/bar", "Resolves with correct path" );
	assert.ok( this.fsMkdirStub.calledWith( "/foo/bar" ), "/foo/bar", "Tries to create directory" );
	assert.notOk( this.statStub.called, "Doesn't call stat" );

});


test( "New directory", async function( assert ) {

	const existing = [ "/foo" ];
	const error = new Error();
	error.code = "ENOENT";

	const { default: mkdirp } = this.subject();

	this.fsMkdirStub.callsFake( ( dir, callback ) => {
		// parent does not exist
		if ( !existing.includes( path.dirname( dir ) ) ) {
			callback( error );
		} else {
			// create new folder
			existing.push( dir );
			callback( null, dir );
		}
	});

	const dir = await mkdirp( "/foo/bar/baz/qux" );
	assert.strictEqual( dir, "/foo/bar/baz/qux", "Returns path" );
	assert.propEqual(
		this.fsMkdirStub.args.map( args => args[0] ),
		[
			"/foo/bar/baz/qux",
			"/foo/bar/baz",
			"/foo/bar",
			"/foo/bar/baz",
			"/foo/bar/baz/qux"
		],
		"Creates all necessary parent directories"
	);
	assert.propEqual(
		existing,
		[
			"/foo",
			"/foo/bar",
			"/foo/bar/baz",
			"/foo/bar/baz/qux"
		],
		"Checks all required parent directories"
	);
	assert.notOk( this.statStub.called, "Doesn't call stat" );

});


test( "Non-writable parent directory", async function( assert ) {

	const errorStat = new Error( "stat fail" );

	const { default: mkdirp } = this.subject();

	this.statStub.rejects( errorStat );
	this.fsMkdirStub.callsFake( ( dir, callback ) => {
		const err = new Error();
		// parent dir /foo exists, but is not writable
		err.code = dir === "/foo"
			? "EACCES"
			: "ENOENT";
		callback( err );
	});

	await assert.rejects(
		mkdirp( "/foo/bar" ),
		errorStat,
		"Rejects if parent dir not writable"
	);
	assert.propEqual(
		this.fsMkdirStub.args.map( args => args[0] ),
		[ "/foo/bar", "/foo" ],
		"Tries to create all parent directories"
	);
	assert.ok( this.statStub.calledWith( "/foo" ), "Checks whether parent dir is writable" );

});


test( "Directory check function", async function( assert ) {

	const { check: checkPosix } = this.subject( false );
	const { check: checkWin } = this.subject( true );

	assert.ok(
		checkPosix({
			mode: R_OK | W_OK,
			isDirectory() { return true; }
		}),
		"Writable dir on POSIX"
	);

	assert.notOk(
		checkPosix({
			mode: R_OK,
			isDirectory() { return true; }
		}),
		"Non-writable dir on POSIX"
	);

	assert.notOk(
		checkPosix({
			mode: W_OK,
			isDirectory() { return false; }
		}),
		"Non-dir on POSIX"
	);

	assert.ok(
		checkWin({
			mode: R_OK,
			isDirectory() { return true; }
		}),
		"Dir on Windows"
	);

	assert.notOk(
		checkWin({
			mode: R_OK,
			isDirectory() { return false; }
		}),
		"Non-dir on Windows"
	);

});
