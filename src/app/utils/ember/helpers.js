define( [ "Moment" ], function( Moment ) {

	var helpers = {};

	helpers[ "is-equal" ] = function( a, b ) { return a === b; };
	helpers[ "is-null" ]  = function( a )    { return a === null; };
	helpers[ "is-gt" ]    = function( a, b ) { return a > b; };
	helpers[ "is-gte" ]   = function( a, b ) { return a >= b; };

	helpers[ "bool-not" ] = function( a )    { return !a; };
	helpers[ "bool-and" ] = function( a, b ) { return a && b; };
	helpers[ "bool-or" ]  = function( a, b ) { return a || b; };

	helpers[ "math-add" ] = function( a, b ) { return a + b; };
	helpers[ "math-sub" ] = function( a, b ) { return a - b; };
	helpers[ "math-mul" ] = function( a, b ) { return a * b; };
	helpers[ "math-div" ] = function( a, b ) { return a / b; };

	helpers[ "format-time" ] = function( date, format ) {
		return new Moment( date ).format( format );
	};

	helpers[ "time-from-now" ] = function helperTimeFromNow( date, suffix ) {
		return new Moment( date ).fromNow( suffix );
	};

	helpers[ "hours-from-now" ] = function helperHoursFromNow( time ) {
		var diff = Math.floor( Math.max( 0, new Moment().diff( time, "minutes", true ) ) );
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
