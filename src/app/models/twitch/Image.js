define( [ "ember", "ember-data" ], function( Ember, DS ) {

	var get = Ember.get,
		nocache_url = "%@?_=%@";

	function nocache( attr ) {
		return Ember.computed( attr, function() {
			return nocache_url.fmt( get( this, attr ), +new Date() );
		});
	}

	return DS.Model.extend({
		large: DS.attr( "string" ),
		medium: DS.attr( "string" ),
		small: DS.attr( "string" ),
		template: DS.attr( "string" ),

		large_nocache: nocache( "large" ),
		medium_nocache: nocache( "medium" ),
		small_nocache: nocache( "small" )
	});

});
