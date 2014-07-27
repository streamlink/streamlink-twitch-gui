define( [ "ember" ], function( Ember ) {

	Ember.$.extend( true, Ember.Inflector.inflector.rules, {
		uncountable: [
			"settings",
			"githubreleases"
		].reduce(function( obj, value ) { obj[ value ] = true; return obj; }, {} )
	});

});
