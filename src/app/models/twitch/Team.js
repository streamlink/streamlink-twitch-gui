define( [ "EmberData" ], function( DS ) {

	var attr = DS.attr;

	return DS.Model.extend({
		background: attr( "string" ),
		banner: attr( "string" ),
		created_at: attr( "date" ),
		display_name: attr( "string" ),
		info: attr( "string" ),
		logo: attr( "string" ),
		name: attr( "string" ),
		updated_at: attr( "date" )
	});

});
