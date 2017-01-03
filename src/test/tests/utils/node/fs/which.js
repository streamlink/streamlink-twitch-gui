/* globals PATHFIXTURES */
import {
	module,
	test
} from "QUnit";
import { isWin } from "utils/node/platform";
import whichInjector from "inject?utils/node/env-path!utils/node/fs/which";
import {
	isFile,
	isExecutable
} from "utils/node/fs/stat";
import { resolve as r } from "path";


const moduleEnvPath = "utils/node/env-path";

const pFixtures = r( PATHFIXTURES, "utils", "node", "fs", "which" );
const pA = r( pFixtures, "one-is-not-executable" );
const pB = r( pFixtures, "one-is-executable" );
const fileOne = "one";
const fileTwo = "two";
const fileNonExistent = "file-that-does-not-exist";


module( "utils/node/fs/which" );


test( "Relative or absolute path", assert => {

	assert.expect( 1 );

	// it's okay to not use the stubbed path module here
	// PATHFIXTURES already contains the expected path separator
	const pFile = r( pA, fileOne );
	const which = whichInjector({
		[ moduleEnvPath ]: { paths: [] }
	})[ "default" ];

	return which( pFile, isFile )
		.then( path => {
			assert.equal( path, pFile, "Returns file path" );
		});

});


test( "Non-existing file in single path", assert => {

	assert.expect( 1 );

	const which = whichInjector({
		[ moduleEnvPath ]: { paths: [ pA ] }
	})[ "default" ];

	return which( fileNonExistent, isFile )
		.catch( () => {
			assert.ok( true, "Rejects promise" );
		});

});


test( "Executable in single path", assert => {

	assert.expect( 1 );

	const which = whichInjector({
		[ moduleEnvPath ]: { paths: [ pB ] }
	})[ "default" ];

	return which( fileOne, isExecutable )
		.then( path => {
			let expected = r( pB, fileOne );
			assert.equal( path, expected, "Finds executable and returns absolute path" );
		});

});


test( "Non-existing file in multiple paths", assert => {

	assert.expect( 1 );

	const which = whichInjector({
		[ moduleEnvPath ]: { paths: [ pA, pB ] }
	})[ "default" ];

	return which( fileNonExistent, isFile )
		.catch( () => {
			assert.ok( true, "Rejects promise if file could not be found" );
		});

});


test( "File not in first path", assert => {

	assert.expect( 1 );

	const which = whichInjector({
		[ moduleEnvPath ]: { paths: [ pB, pA ] }
	})[ "default" ];

	return which( fileTwo, isFile )
		.then( path => {
			let expected = r( pA, fileTwo );
			assert.equal( path, expected, "Finds file and returns absolute path" );
		});

});


test( "File with same name in multiple paths", assert => {

	assert.expect( 1 );

	const which = whichInjector({
		[ moduleEnvPath ]: { paths: [ pA, pB ] }
	})[ "default" ];

	return which( fileOne, isFile )
		.then( path => {
			let expected = r( pA, fileOne );
			assert.equal( path, expected, "Finds file and returns absolute path" );
		});

});


test( "Executable with same name in multiple paths", assert => {

	assert.expect( 1 );

	const which = whichInjector({
		[ moduleEnvPath ]: { paths: [ pA, pB ] }
	})[ "default" ];

	return which( fileOne, isExecutable )
		.then( path => {
			let expected = r( isWin ? pA : pB, fileOne );
			assert.equal( path, expected, "Finds executable and returns absolute path" );
		});

});
