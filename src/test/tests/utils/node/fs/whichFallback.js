/* globals PATHFIXTURES */
import {
	module,
	test
} from "qunit";
import resolvePathInjector from "inject-loader?utils/node/platform!utils/node/resolvePath";
import whichInjector from "inject-loader?utils/node/env-path!utils/node/fs/which";
import whichFallbackInjector
	from "inject-loader?-utils/node/fs/stat&-path!utils/node/fs/whichFallback";
import { resolve as r } from "path";


const modulePlatform = "utils/node/platform";
const moduleResolvePath = "utils/node/resolvePath";
const moduleEnvPath = "utils/node/env-path";
const moduleWhich = "utils/node/fs/which";

const resolvePath = resolvePathInjector({
	[ modulePlatform ]: { isWin: false }
});

const pFixtures = r( PATHFIXTURES, "utils", "node", "fs", "whichFallback" );
const pA = r( pFixtures, "a" );
const pB = r( pFixtures, "b" );
const pC = r( pFixtures, "c" );
const pD = r( pFixtures, "d" );
const fileOne = "one";
const fileTwo = "two";
const fileThree = "three";
const fileNonExistent = "file-that-does-not-exist";

const currentPlatform = "currentPlatform";
const differentPlatform = "differentPlatform";


let ENV;


module( "utils/node/fs/whichFallback", {
	beforeEach() {
		ENV = process.env;
	},
	afterEach() {
		process.env = ENV;
	}
});


test( "Non-existent executable with no fallback", assert => {

	assert.expect( 1 );
	const whichFallback = whichFallbackInjector({
		[ modulePlatform ]: { platform: currentPlatform },
		[ moduleResolvePath ]: resolvePath,
		[ moduleWhich ]: whichInjector({
			[ moduleEnvPath ]: { paths: [ pA ] }
		})
	})[ "default" ];

	return whichFallback( fileNonExistent )
		.catch( () => {
			assert.ok( true, "Rejects promise if no file was found" );
		});

});


test( "Single executable with no fallback", assert => {

	assert.expect( 1 );
	const whichFallback = whichFallbackInjector({
		[ modulePlatform ]: { platform: currentPlatform },
		[ moduleResolvePath ]: resolvePath,
		[ moduleWhich ]: whichInjector({
			[ moduleEnvPath ]: { paths: [ pA ] }
		})
	})[ "default" ];

	return whichFallback( fileOne )
		.then( path => {
			let expected = r( pA, fileOne );
			assert.equal( path, expected, "Resolves promise and returns absolute path" );
		});

});


test( "Single platform specific executable with no fallback", assert => {

	assert.expect( 1 );
	const whichFallback = whichFallbackInjector({
		[ modulePlatform ]: { platform: currentPlatform },
		[ moduleResolvePath ]: resolvePath,
		[ moduleWhich ]: whichInjector({
			[ moduleEnvPath ]: { paths: [ pA ] }
		})
	})[ "default" ];

	return whichFallback({
		[ currentPlatform ]: fileOne
	})
		.then( path => {
			let expected = r( pA, fileOne );
			assert.equal( path, expected, "Resolves promise and returns absolute path" );
		});

});


test( "Multiple platform specific executables with multiple paths and no fallbacks", assert => {

	assert.expect( 2 );
	const whichFallback = whichFallbackInjector({
		[ modulePlatform ]: { platform: currentPlatform },
		[ moduleResolvePath ]: resolvePath,
		[ moduleWhich ]: whichInjector({
			[ moduleEnvPath ]: { paths: [ pA, pB ] }
		})
	})[ "default" ];

	return Promise.all([
		whichFallback({
			[ currentPlatform ]: [ fileOne, fileTwo ]
		})
			.then( path => {
				let expected = r( pA, fileOne );
				assert.equal( path, expected, "Finds the first file in the first path" );
			}),
		whichFallback({
			[ currentPlatform ]: [ fileTwo, fileOne ]
		})
			.then( path => {
				let expected = r( pB, fileTwo );
				assert.equal( path, expected, "Finds the first file in the second path" );
			})
	]);

});


test( "Non-existing single executable with fallbacks", assert => {

	assert.expect( 1 );
	const whichFallback = whichFallbackInjector({
		[ modulePlatform ]: { platform: currentPlatform },
		[ moduleResolvePath ]: resolvePath,
		[ moduleWhich ]: whichInjector({
			[ moduleEnvPath ]: { paths: [ pA ] }
		})
	})[ "default" ];

	return whichFallback(
		fileNonExistent,
		[ pB, pC, pD ]
	)
		.catch( () => {
			assert.ok( true, "Rejects promise if file could not be found" );
		});

});


test( "Single executable with fallbacks", assert => {

	assert.expect( 1 );
	const whichFallback = whichFallbackInjector({
		[ modulePlatform ]: { platform: currentPlatform },
		[ moduleResolvePath ]: resolvePath,
		[ moduleWhich ]: whichInjector({
			[ moduleEnvPath ]: { paths: [ pA ] }
		})
	})[ "default" ];

	return whichFallback(
		[ fileThree ],
		[ pB, pC, pD ]
	)
		.then( path => {
			let expected = r( pD, fileThree );
			assert.equal( path, expected, "Finds file in third fallback path" );
		});

});


test( "Single platform specific executable with platform specific fallbacks", assert => {

	assert.expect( 1 );
	const whichFallback = whichFallbackInjector({
		[ modulePlatform ]: { platform: currentPlatform },
		[ moduleResolvePath ]: resolvePath,
		[ moduleWhich ]: whichInjector({
			[ moduleEnvPath ]: { paths: [ pA ] }
		})
	})[ "default" ];

	return whichFallback({
		[ currentPlatform ]: fileTwo
	}, {
		[ differentPlatform ]: [ pB ],
		[ currentPlatform ]: [ pC ]
	})
		.then( path => {
			let expected = r( pC, fileTwo );
			assert.equal(
				path,
				expected,
				"Uses the correct platform specific fallback path and finds file"
			);
		});

});


test( "Dynamic fallback paths", assert => {

	assert.expect( 1 );
	const whichFallback = whichFallbackInjector({
		[ modulePlatform ]: { platform: currentPlatform },
		[ moduleResolvePath ]: resolvePath,
		[ moduleWhich ]: whichInjector({
			[ moduleEnvPath ]: { paths: [ pA ] }
		})
	})[ "default" ];
	process.env = { FOO: pA, BAR: pD };

	return whichFallback({
		[ currentPlatform ]: fileThree
	}, {
		[ currentPlatform ]: [ "$FOO", "$BAR" ]
	})
		.then( path => {
			let expected = r( pD, fileThree );
			assert.equal( path, expected, "Uses dynamic fallback paths and finds file" );
		});

});
