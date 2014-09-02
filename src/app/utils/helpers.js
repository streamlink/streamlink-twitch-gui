define( [ "ember", "moment" ], function( Ember, Moment ) {

	Ember.Handlebars.helper( "time-from-now", function( date, suffix ) {
		return Moment( date ).fromNow( suffix );
	});

	Ember.Handlebars.helper( "hours-from-now", function( time ) {
		var diff = Math.floor( Math.max( 0, Moment().diff( time, "minutes", true ) ) );
		return diff < 1
			? "just now"
			: diff < 60
			? ( diff % 60 < 10 ? "0" : "" ) + ( diff % 60 ).toFixed( 0 ) + "m"
			: ( diff / 60 ).toFixed( 1 ) + "h";
	});

	Ember.Handlebars.helper( "format-viewers", function( viewers ) {
		return viewers >= 1000000
			? ( Math.floor( viewers / 10000 ) / 100 ).toFixed( 2 ) + "m"
			: viewers >= 100000
			? ( Math.floor( viewers / 1000 ) ).toFixed( 0 ) + "k"
			: viewers >= 10000
			? ( Math.floor( viewers / 100 ) / 10 ).toFixed( 1 ) + "k"
			: viewers.toFixed( 0 );
	});

});
