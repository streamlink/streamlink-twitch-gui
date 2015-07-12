define([
	"utils/ember/helpers"
], function(
	helpers
) {

	QUnit.module( "Ember handlebars helpers" );


	QUnit.test( "Hours from now", function( assert ) {

		var _ = helpers[ "hours-from-now" ];

		assert.deepEqual(
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

		assert.deepEqual(
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

		assert.deepEqual(
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


	QUnit.test( "Format viewers", function( assert ) {

		var _ = helpers[ "format-viewers" ];

		assert.deepEqual(
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

		assert.deepEqual(
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

		assert.deepEqual(
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

		assert.deepEqual(
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
