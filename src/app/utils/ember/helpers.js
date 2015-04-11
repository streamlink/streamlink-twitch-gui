define( [ "moment" ], function( moment ) {

	var helpers = {};

	helpers[ "is-equal" ] = function( a, b ) {
		return a === b;
	};

	helpers[ "is-null" ] = function( a ) {
		return a === null;
	};

	helpers[ "is-not" ] = function( a ) {
		return !a;
	};

	helpers[ "is-gt" ] = function( a, b ) {
		return a > b;
	};

	helpers[ "is-gte" ] = function( a, b ) {
		return a >= b;
	};

	helpers[ "format-time" ] = function( date, format ) {
		return moment( date ).format( format );
	};

	helpers[ "time-from-now" ] = function helperTimeFromNow( date, suffix ) {
		return moment( date ).fromNow( suffix );
	};

	helpers[ "hours-from-now" ] = function helperHoursFromNow( time ) {
		var diff = Math.floor( Math.max( 0, moment().diff( time, "minutes", true ) ) );
		return diff < 1
			? "just now"
			: diff < 60
			? ( diff % 60 < 10 ? "0" : "" ) + ( diff % 60 ).toFixed( 0 ) + "m"
			: ( diff / 60 ).toFixed( 1 ) + "h";
	};

	helpers[ "format-viewers" ] = function helperFormatViewers( viewers ) {
		viewers = Number( viewers );
		return isNaN( viewers )
			? "0"
			: viewers >= 1000000
			? ( Math.floor( viewers / 10000 ) / 100 ).toFixed( 2 ) + "m"
			: viewers >= 100000
			? ( Math.floor( viewers / 1000 ) ).toFixed( 0 ) + "k"
			: viewers >= 10000
			? ( Math.floor( viewers / 100 ) / 10 ).toFixed( 1 ) + "k"
			: viewers.toFixed( 0 );
	};

	return helpers;

});
