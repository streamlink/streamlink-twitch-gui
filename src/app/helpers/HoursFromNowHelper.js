define( [ "Ember", "Moment" ], function( Ember, Moment ) {

	return Ember.Helper.helper(function( params ) {
		var minutes = new Moment().diff( params[0], "minutes", true );
		var diff    = Math.floor( Math.max( 0, minutes ) );
		return diff < 1
			? "just now"
			: diff < 60
			? ( diff % 60 < 10 ? "0" : "" ) + ( diff % 60 ).toFixed( 0 ) + "m"
			: ( diff / 60 ).toFixed( 1 ) + "h";
	});

});
