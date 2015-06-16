define( [ "EmberData" ], function( DS ) {

	return DS.Model.extend({
		background: DS.attr( "string" ),
		banner: DS.attr( "string" ),
		created_at: DS.attr( "date" ),
		display_name: DS.attr( "string" ),
		info: DS.attr( "string" ),
		logo: DS.attr( "string" ),
		name: DS.attr( "string" ),
		updated_at: DS.attr( "date" )
	});

});
