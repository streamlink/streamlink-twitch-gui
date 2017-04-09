/* globals PATHFIXTURES */
import {
	module,
	test
} from "qunit";
import { isWin } from "utils/node/platform";
import {
	stat,
	isFile,
	isExecutable,
	isDirectory
} from "utils/node/fs/stat";
import { Stats } from "fs";
import { resolve as r } from "path";


const pFixtures = r( PATHFIXTURES, "utils", "node", "fs", "stat" );
const pNoFile = r( pFixtures, "file-that-does-not-exist" );
const pFile = r( pFixtures, "file" );
const pExecutable = r( pFixtures, "executable" );
const pDirectory = r( pFixtures, "directory" );


module( "utils/node/fs/stat" );


test( "Non existing file", assert => {

	assert.expect( 1 );
	return stat( pNoFile )
		.catch( () => {
			assert.ok( true, "Rejects promise on non existing files" );
		});

});


test( "isFile", assert => {

	assert.expect( 1 );
	return stat( pFile, isFile )
		.then( path => {
			assert.equal( path, pFile, "Returns file path" );
		});

});


test( "isExecutable", assert => {

	assert.expect( 1 );
	return stat( pExecutable, isExecutable )
		.then( path => {
			assert.equal( path, pExecutable, "Returns executable path" );
		});

});


test( "not isExecutable", assert => {

	assert.expect( 1 );
	return stat( pFile, isExecutable )
		.then( () => {
			assert.ok( isWin, "File is not an executable" );
		}, () => {
			assert.ok( !isWin, "File is not an executable" );
		});

});


test( "isDirectory", assert => {

	assert.expect( 1 );
	return stat( pDirectory, isDirectory )
		.then( path => {
			assert.equal( path, pDirectory, "Returns directory path" );
		});

});


test( "No callback", assert => {

	assert.expect( 1 );
	return stat( pFile )
		.then( path => {
			assert.equal( path, pFile, "Returns file path" );
		});
});


test( "Return stats object", assert => {

	assert.expect( 1 );
	return stat( pFile, null, true )
		.then( statsObj => {
			assert.ok( statsObj instanceof Stats, "is instance of fs.Stats" );
		});

});
