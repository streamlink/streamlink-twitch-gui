define( [ "Ember", "EmberData" ], function( Ember, DS ) {

	var get  = Ember.get;
	var attr = DS.attr;
	var url  = "%@?_=%@";
	var time = 60;

	function nocache( attr ) {
		// use a volatile property
		return Ember.computed( attr, function() {
			// use the same timestamp for `time` seconds
			var timestamp = +new Date() / 1000;
			timestamp -= timestamp % time;
			return url.fmt( get( this, attr ), timestamp );
		}).volatile();
	}

	return DS.Model.extend({
		large   : attr( "string" ),
		medium  : attr( "string" ),
		small   : attr( "string" ),
		template: attr( "string" ),

		large_nocache : nocache( "large" ),
		medium_nocache: nocache( "medium" ),
		small_nocache : nocache( "small" )
	});

});
