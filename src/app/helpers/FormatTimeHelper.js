define([
	"Ember",
	"Moment"
], function(
	Ember,
	Moment
) {

	return Ember.Helper.helper(function( params, hash ) {
		return new Moment( params[0] ).format( hash.format || params[1] );
	});

});
