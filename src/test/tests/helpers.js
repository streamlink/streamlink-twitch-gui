define( [ "utils/helpers" ], function( helpers ) {

	module( "Ember handlebars helpers" );


	test( "Hours from now", function() {

		var _ = helpers[ "hours-from-now" ];

		deepEqual(
			[
				_( +new Date() ),
				_( +new Date() - 59 * 1000 )
			],
			[
				"just now",
				"just now"
			],
			"Less than a minute"
		);

		deepEqual(
			[
				_( +new Date() - 60 * 1000 ),
				_( +new Date() - 59 * 60 * 1000 )
			],
			[
				"01m",
				"59m"
			],
			"Minutes"
		);

		deepEqual(
			[
				_( +new Date() - 60 * 60 * 1000 ),
				_( +new Date() - Math.PI * 60 * 60 * 1000 )
			],
			[
				"1.0h",
				"3.1h"
			],
			"Hours"
		);

	});


	test( "Format viewers", function() {

		var _ = helpers[ "format-viewers" ];

		deepEqual(
			[
				_( "" ),
				_( "foo" )
			],
			[
				"0",
				"0"
			],
			"Unexpected values"
		);

		deepEqual(
			[
				_( 1 ),
				_( 10 ),
				_( 100 ),
				_( 1000 ),
				_( 9999 )
			],
			[
				"1",
				"10",
				"100",
				"1000",
				"9999"
			],
			"Less than 5 digits"
		);

		deepEqual(
			[
				_( 10000 ),
				_( 10099 ),
				_( 10100 ),
				_( 99999 ),
				_( 100000 ),
				_( 999999 )
			],
			[
				"10.0k",
				"10.0k",
				"10.1k",
				"99.9k",
				"100k",
				"999k"
			],
			"Thousands"
		);

		deepEqual(
			[
				_( 1000000 ),
				_( 1009999 ),
				_( 1010000 )
			],
			[
				"1.00m",
				"1.00m",
				"1.01m"
			],
			"Millions"
		);

	});

});
