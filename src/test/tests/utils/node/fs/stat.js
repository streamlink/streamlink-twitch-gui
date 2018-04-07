import { module, test } from "qunit";
import sinon from "sinon";
import { posix as path } from "path";

import statInjector from "inject-loader?-util!utils/node/fs/stat";


module( "utils/node/fs/stat", {
	beforeEach() {
		this.resolveStub = sinon.stub().callsFake( ( ...args ) => path.resolve( ...args ) );
		this.statStub = sinon.stub();

		this.subject = isWin => statInjector({
			"utils/node/platform": {
				isWin: !!isWin
			},
			"path": {
				resolve: this.resolveStub
			},
			"fs": {
				stat: this.statStub
			}
		});
	}
});


test( "Without callback", async function( assert ) {

	const error = new Error( "fail" );
	const statsObj = {};

	const { stat } = this.subject();

	this.statStub.callsFake( ( dir, callback ) => callback( error ) );

	await assert.rejects( stat( "/foo/bar" ), error, "Rejects on stat failure" );
	assert.ok( this.resolveStub.calledWith( "/foo/bar" ), "Resolves path" );
	assert.ok( this.resolveStub.calledBefore( this.statStub ), "Resolves path before stat" );
	assert.ok( this.statStub.calledWith( "/foo/bar" ), "Calls stat with correct path" );

	this.statStub.reset();
	this.statStub.callsFake( ( dir, callback ) => callback( null, statsObj ) );

	const resolvedPath = await stat( "/foo/bar" );
	assert.strictEqual( resolvedPath, "/foo/bar", "Resolves with path" );

	const stats = await stat( "/foo/bar", null, true );
	assert.strictEqual( stats, statsObj, "Resolves with stats object" );

});


test( "With callback", async function( assert ) {

	class Stats {
		constructor( success ) {
			this.success = success;
		}
		validate() {
			return this.success;
		}
	}
	const paths = {
		"/foo/bar": new Stats( false ),
		"/foo/qux": new Stats( true )
	};
	const check = stats => stats.validate();

	const { stat } = this.subject();

	this.statStub.callsFake( ( dir, callback ) => callback( null, paths[ dir ] ) );

	await assert.rejects(
		stat( "/foo/bar", check ),
		new Error( "Invalid" ),
		"Rejects if callback fails"
	);
	assert.strictEqual(
		await stat( "/foo/qux", check ),
		"/foo/qux",
		"Resolves if callback succeeds"
	);
	assert.ok(
		await stat( "/foo/qux", check, true ) instanceof Stats,
		"Resolves with stats object"
	);

});


test( "Validation callbacks", function( assert ) {

	const { isDirectory, isFile, isExecutable: isExecWin } = this.subject( true );
	const { isExecutable: isExecPosix } = this.subject( false );

	assert.notOk( isDirectory({ isDirectory() { return false; } }), "Is not a directory" );
	assert.ok( isDirectory({ isDirectory() { return true; } }), "Is a directory" );

	assert.notOk( isFile({ isFile() { return false; } }), "Is not a file" );
	assert.ok( isFile({ isFile() { return true; } }), "Is a file" );

	assert.notOk( isExecWin({ isFile() { return false; }, mode: 0 }), "Isn't an executable" );
	assert.ok( isExecWin({ isFile() { return true; }, mode: 0 }), "Is an executable" );

	assert.notOk( isExecPosix({ isFile() { return false; }, mode: 0 }), "Isn't an executable" );
	assert.notOk( isExecPosix({ isFile() { return false; }, mode: 0o111 }), "Isn't an executable" );
	assert.notOk( isExecPosix({ isFile() { return true; }, mode: 0 }), "Is not executable" );
	assert.ok( isExecPosix({ isFile() { return true; }, mode: 0o111 }), "Is an executable" );
	assert.ok( isExecPosix({ isFile() { return true; }, mode: 0o100 }), "Is an executable" );
	assert.ok( isExecPosix({ isFile() { return true; }, mode: 0o010 }), "Is an executable" );
	assert.ok( isExecPosix({ isFile() { return true; }, mode: 0o001 }), "Is an executable" );

});
