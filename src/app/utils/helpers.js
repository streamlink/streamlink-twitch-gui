define( [ "ember", "moment" ], function( Ember, Moment ) {

	Ember.Handlebars.helper( "hours-from-now", function( datestr ) {
		return Math.max( 0, Moment().diff( datestr, "hours", true ) ).toFixed( 1 ) + "h";
	});

	Ember.Handlebars.helper( "format-viewers", function( viewers ) {
		/*
		 * 1
		 * 10
		 * 100
		 * 1000
		 * 10.0k
		 * 100k
		 * 1.00m
		 */
		return viewers >= 1000000
			? ( viewers / 1000000 ).toFixed( 2 ) + "m"
			: viewers >= 10000
			? ( viewers / 1000 ).toFixed( viewers >= 100000 ? 0 : 1 ) + "k"
			: viewers;
	});

});
