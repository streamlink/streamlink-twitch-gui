define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		mature: DS.attr( "boolean" ),
		background: DS.attr( "string" ),
		updated_at: DS.attr( "date" ),
		status: DS.attr( "string" ),
		logo: DS.attr( "string" ),
		teams: DS.hasMany( "twitchTeam" ),
		url: DS.attr( "string" ),
		display_name: DS.attr( "string" ),
		game: DS.attr( "string" ),
		banner: DS.attr( "string" ),
		name: DS.attr( "string" ),
		video_banner: DS.attr( "string" ),
		created_at: DS.attr( "date" )
	});

});
