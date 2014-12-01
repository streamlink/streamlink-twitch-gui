define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		background: DS.attr( "string" ),
		banner: DS.attr( "string" ),
		broadcaster_language: DS.attr( "string" ),
		created_at: DS.attr( "date" ),
		delay: DS.attr( "number" ),
		display_name: DS.attr( "string" ),
		followers: DS.attr( "number" ),
		game: DS.attr( "string" ),
		language: DS.attr( "string" ),
		logo: DS.attr( "string" ),
		mature: DS.attr( "boolean" ),
		name: DS.attr( "string" ),
		partner: DS.attr( "boolean" ),
		profile_banner: DS.attr( "string" ),
		profile_banner_background_color: DS.attr( "string" ),
		status: DS.attr( "string" ),
		teams: DS.hasMany( "twitchTeam" ),
		updated_at: DS.attr( "date" ),
		url: DS.attr( "string" ),
		video_banner: DS.attr( "string" ),
		views: DS.attr( "number" ),

		// Twitch.tv API bug?
		// Sometimes a user record (/user/:user - model not implemented) is embedded into
		// a stream record instead of a channels record (/channels/:channel - the current model).
		// We're defining the "missing" attributes, so that ember-data doesn't complain...
		bio: DS.attr(),
		type: DS.attr()
	}).reopenClass({
		toString: function() { return "channels" }
	});

});
