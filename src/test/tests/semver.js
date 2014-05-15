define( [ "utils/semver" ], function( SemVer ) {

	var	T = SemVer.tokenize,
		M = SemVer.getMax,
		S = SemVer.sort;


	module( "Semantic versioning" );


	test( "Tokenization", function() {

		deepEqual(
			[
				T( "foo" ),
				T( "1.0" ),
				T( "foo1.0.0bar" ),
				T( "1.0.0-" ),
				T( "1.0.0+" )
			],
			[
				undefined,
				undefined,
				undefined,
				undefined,
				undefined
			],
			"Invalid values"
		);

		deepEqual(
			[
				T( "1.0.0" ),
				T( "   v1.0.0   " ),
				T( "1.23.456" )
			],
			[
				[ [ 1, 0, 0 ], undefined ],
				[ [ 1, 0, 0 ], undefined ],
				[ [ 1, 23, 456 ], undefined ]
			],
			"Major, minor and patch version"
		);

		deepEqual(
			[
				T( "1.0.0-1.2.3" ),
				T( "1.0.0-alpha" ),
				T( "1.0.0-alpha.1" ),
				T( "1.0.0-alpha.beta1" ),
				T( "1.0.0-beta+abc123" )
			],
			[
				[ [ 1, 0, 0 ], [ 1, 2, 3 ] ],
				[ [ 1, 0, 0 ], [ "alpha" ] ],
				[ [ 1, 0, 0 ], [ "alpha", 1 ] ],
				[ [ 1, 0, 0 ], [ "alpha", "beta1" ] ],
				[ [ 1, 0, 0 ], [ "beta" ] ]
			],
			"Pre-release and build metadata"
		);

	});


	test( "Maximum", function() {

		deepEqual(
			[
				M([ "0.0.1", "0.0.10", "0.0.2" ]),
				M([ "0.0.10", "0.1.0", "0.2.0" ]),
				M([ "1.0.0", "0.10.0", "0.10.10" ])
			],
			[
				"0.0.10",
				"0.2.0",
				"1.0.0"
			],
			"Major, minor and patch version"
		);

		deepEqual(
			[
				M([ "1.0.0-123", "1.0.0-alpha" ]),
				M([ "1.0.0-alpha", "1.0.0-alpha.1" ]),
				M([ "1.0.0-alpha.1", "1.0.0-alpha.beta" ]),
				M([ "1.0.0-alpha.beta", "1.0.0-beta" ]),
				M([ "1.0.0-beta", "1.0.0-beta.2" ]),
				M([ "1.0.0-beta.2", "1.0.0-beta.11" ]),
				M([ "1.0.0-beta.11", "1.0.0" ])
			],
			[
				"1.0.0-alpha",
				"1.0.0-alpha.1",
				"1.0.0-alpha.beta",
				"1.0.0-beta",
				"1.0.0-beta.2",
				"1.0.0-beta.11",
				"1.0.0"
			],
			"Pre-release and build metadata"
		);

	});


	test( "Sorting", function() {

		deepEqual(
			S([
				"1.0.0",
				"0.0.10",
				"0.1.0",
				"0.10.0",
				"0.0.1"
			]),
			[
				"0.0.1",
				"0.0.10",
				"0.1.0",
				"0.10.0",
				"1.0.0"
			],
			"Major, minor and patch version"
		);

		deepEqual(
			S([
				"1.0.0-beta",
				"1.0.0-alpha.beta",
				"1.0.0-alpha1",
				"1.0.0-1",
				"1.0.0-beta.2",
				"1.0.0-alpha",
				"1.0.0",
				"1.0.0-beta.11",
				"1.0.0-alpha.1",
				"1.0.0-rc.1",
				"1.0.0-123"
			]),
			[
				"1.0.0-1",
				"1.0.0-123",
				"1.0.0-alpha",
				"1.0.0-alpha.1",
				"1.0.0-alpha.beta",
				"1.0.0-alpha1",
				"1.0.0-beta",
				"1.0.0-beta.2",
				"1.0.0-beta.11",
				"1.0.0-rc.1",
				"1.0.0"
			],
			"Pre-release and build metadata"
		);

	});

});
