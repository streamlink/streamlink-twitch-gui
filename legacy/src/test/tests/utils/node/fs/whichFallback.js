// TODO: properly rewrite tests by using sinon
import { module, test } from "qunit";

import whichFallbackInjector from "inject-loader!utils/node/fs/whichFallback";


module( "utils/node/fs/whichFallback" );


test( "No fallback", async assert => {

	assert.expect( 24 );

	let expected;
	let isExecutable = () => true;

	const { default: whichFallback } = whichFallbackInjector({
		"path": {},
		"utils/node/resolvePath": {},
		"utils/node/platform": {
			platform: "linux"
		},
		"utils/node/fs/stat": {
			isExecutable,
			async stat() {
				assert.ok( false, "Should not get called" );
			}
		},
		"utils/node/fs/which": async ( path, callback ) => {
			assert.step( path );
			if ( path !== expected ) {
				throw new Error();
			}
			assert.strictEqual( callback, isExecutable, "Uses the correct verification callback" );
			return path;
		}
	});

	await assert.rejects(
		whichFallback( "" ),
		new Error( "Missing executable name" ),
		"Rejects on missing executable"
	);

	await assert.rejects(
		whichFallback( "foo" ),
		new Error( "Executables were not found" ),
		"Rejects"
	);
	assert.checkSteps( [ "foo" ], "Calls which() in correct order" );

	await assert.rejects(
		whichFallback([ "foo", "bar" ]),
		new Error( "Executables were not found" ),
		"Rejects"
	);
	assert.checkSteps( [ "foo", "bar" ], "Calls which() in correct order" );

	await assert.rejects(
		whichFallback({ linux: "foo", darwin: "bar" }),
		new Error( "Executables were not found" ),
		"Rejects"
	);
	assert.checkSteps( [ "foo" ], "Calls which() in correct order" );

	await assert.rejects(
		whichFallback({ linux: [ "foo", "baz" ], darwin: "bar" }),
		new Error( "Executables were not found" ),
		"Rejects"
	);
	assert.checkSteps( [ "foo", "baz" ], "Calls which() in correct order" );

	expected = "bar";

	await ( async () => {
		const resolvedPath = await whichFallback([ "foo", "bar", "baz" ]);
		assert.strictEqual( resolvedPath, "bar", "Resolves with correct path" );
		assert.checkSteps( [ "foo", "bar" ], "Calls which() in correct order" );
	})();

	isExecutable = () => false;

	await ( async () => {
		const resolvedPath = await whichFallback( "bar", null, isExecutable );
		assert.strictEqual( resolvedPath, "bar", "Resolves with correct path" );
		assert.checkSteps( [ "bar" ], "Calls which() in correct order" );
	})();

});


test( "Fallback only", async assert => {

	assert.expect( 73 );

	let expected;
	let isExecutable = () => true;

	const { default: whichFallback } = whichFallbackInjector({
		"path": {
			join( ...args ) {
				assert.step( "join" );
				return args.join( "/" );
			}
		},
		"utils/node/platform": {
			platform: "linux"
		},
		"utils/node/resolvePath": path => {
			assert.step( "resolvePath" );
			assert.step( path );
			return path;
		},
		"utils/node/fs/stat": {
			isExecutable,
			async stat( path, callback ) {
				assert.step( "stat" );
				assert.step( path );
				if ( expected !== path ) {
					throw new Error();
				}
				assert.strictEqual( callback, isExecutable, "Uses correct verification callback" );
				return path;
			}
		},
		"utils/node/fs/which": async () => {
			assert.ok( false, "Should not get called" );
		}
	});

	await assert.rejects(
		whichFallback( "a", "/A", null, true ),
		new Error( "Executables were not found" ),
		"Rejects"
	);
	assert.checkSteps(
		[
			"resolvePath", "/A",
			"join", "stat", "/A/a"
		],
		"Calls methods in correct order"
	);

	await assert.rejects(
		whichFallback( [ "a", "b" ], [ "/A", "/B" ], null, true ),
		new Error( "Executables were not found" ),
		"Rejects"
	);
	assert.checkSteps(
		[
			"resolvePath", "/A",
			"join", "stat", "/A/a",
			"join", "stat", "/A/b",
			"resolvePath", "/B",
			"join", "stat", "/B/a",
			"join", "stat", "/B/b"
		],
		"Calls methods in correct order"
	);

	await assert.rejects(
		whichFallback(
			[ "a", "b" ],
			{
				linux: [ "/A", "/B" ],
				darwin: [ "/C", "/D" ]
			},
			null,
			true
		),
		new Error( "Executables were not found" ),
		"Rejects"
	);
	assert.checkSteps(
		[
			"resolvePath", "/A",
			"join", "stat", "/A/a",
			"join", "stat", "/A/b",
			"resolvePath", "/B",
			"join", "stat", "/B/a",
			"join", "stat", "/B/b"
		],
		"Calls methods in correct order"
	);

	expected = "/B/b";

	await ( async () => {
		const path = await whichFallback( [ "a", "b", "c" ], [ "/A", "/B", "/C" ], null, true );
		assert.strictEqual( path, expected, "Resolves" );
		assert.checkSteps(
			[
				"resolvePath", "/A",
				"join", "stat", "/A/a",
				"join", "stat", "/A/b",
				"join", "stat", "/A/c",
				"resolvePath", "/B",
				"join", "stat", "/B/a",
				"join", "stat", "/B/b"
			],
			"Calls methods in correct order"
		);
	})();

	isExecutable = () => false;

	await ( async () => {
		const path = await whichFallback( "b", "/B", isExecutable, true );
		assert.strictEqual( path, expected, "Resolves" );
		assert.checkSteps(
			[
				"resolvePath", "/B",
				"join", "stat", "/B/b"
			],
			"Calls methods in correct order"
		);
	})();

});


test( "With fallback", async assert => {

	assert.expect( 49 );

	let expected;
	let isExecutable = () => true;

	const check = name => async ( path, callback ) => {
		assert.step( name );
		assert.step( path );
		if ( expected !== path ) {
			throw new Error();
		}
		assert.strictEqual( callback, isExecutable, "Uses correct verification callback" );
		return path;
	};

	const { default: whichFallback } = whichFallbackInjector({
		"path": {
			join( ...args ) {
				assert.step( "join" );
				return args.join( "/" );
			}
		},
		"utils/node/platform": {
			platform: "linux"
		},
		"utils/node/resolvePath": path => {
			assert.step( "resolvePath" );
			assert.step( path );
			return path;
		},
		"utils/node/fs/stat": {
			isExecutable,
			stat: check( "stat" )
		},
		"utils/node/fs/which": check( "which" )
	});

	await assert.rejects(
		whichFallback( [ "a", "b" ], [ "/A", "/B" ] ),
		new Error( "Executables were not found" ),
		"Rejects"
	);
	assert.checkSteps(
		[
			"which", "a",
			"which", "b",
			"resolvePath", "/A",
			"join", "stat", "/A/a",
			"join", "stat", "/A/b",
			"resolvePath", "/B",
			"join", "stat", "/B/a",
			"join", "stat", "/B/b"
		],
		"Calls methods in correct order"
	);

	expected = "b";

	await ( async () => {
		const resolvedPath = await whichFallback( [ "a", "b" ], [ "/A", "/B" ] );
		assert.strictEqual( resolvedPath, expected, "Resolves" );
		assert.checkSteps(
			[
				"which", "a",
				"which", "b"
			],
			"Calls methods in correct order"
		);
	})();

	expected = "/B/a";

	await ( async () => {
		const resolvedPath = await whichFallback( [ "a", "b" ], [ "/A", "/B" ] );
		assert.strictEqual( resolvedPath, expected, "Resolves" );
		assert.checkSteps(
			[
				"which", "a",
				"which", "b",
				"resolvePath", "/A",
				"join", "stat", "/A/a",
				"join", "stat", "/A/b",
				"resolvePath", "/B",
				"join", "stat", "/B/a"
			],
			"Calls methods in correct order"
		);
	})();

});
