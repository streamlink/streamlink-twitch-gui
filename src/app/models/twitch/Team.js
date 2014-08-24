define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		info: DS.attr( "string" ),
		background: DS.attr( "string" ),
		banner: DS.attr( "string" ),
		name: DS.attr( "string" ),
		updated_at: DS.attr( "date" ),
		display_name: DS.attr( "string" ),
		created_at: DS.attr( "date" ),
		logo: DS.attr( "string" )
	});

});
