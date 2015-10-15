define([
	"helpers/-FromNowHelper",
	"Moment"
], function(
	FromNowHelper,
	Moment
) {

	return FromNowHelper.extend({
		_compute: function( params, hash ) {
			return new Moment( params[0] ).fromNow( hash.suffix || params[1] );
		}
	});

});
