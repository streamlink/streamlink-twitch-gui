define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		large: DS.attr( "string" ),
		medium: DS.attr( "string" ),
		small: DS.attr( "string" ),
		template: DS.attr( "string" )
	});

});
