define( [ "Ember", "EmberData" ], function( Ember, DS ) {

	var get = Ember.get;
	var computed = Ember.computed;
	var attr = DS.attr;
	var time = 60;

	function nocache( attr ) {
		// use a volatile property
		return computed( attr, function() {
			var url = get( this, attr );

			// use the same timestamp for `time` seconds
			var expires = this.expires;
			var now     = Math.floor( +new Date() / 1000 );
			if ( !expires || expires < now ) {
				this.expires = expires = now + time;
			}

			return url + "?_=" + expires;
		}).volatile();
	}

	return DS.Model.extend({
		large   : attr( "string" ),
		medium  : attr( "string" ),
		small   : attr( "string" ),
		template: attr( "string" ),

		expires: null,

		large_nocache : nocache( "large" ),
		medium_nocache: nocache( "medium" ),
		small_nocache : nocache( "small" )
	});

});
