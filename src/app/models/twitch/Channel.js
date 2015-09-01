define( [ "Ember", "EmberData" ], function( Ember, DS ) {

	var get = Ember.get;
	var attr = DS.attr;
	var hasMany = DS.hasMany;

	var re_lang = /^([a-z]{2})(:?-([a-z]{2}))?$/;


	return DS.Model.extend({
		background: attr( "string" ),
		banner: attr( "string" ),
		broadcaster_language: attr( "string" ),
		created_at: attr( "date" ),
		delay: attr( "number" ),
		display_name: attr( "string" ),
		followers: attr( "number" ),
		game: attr( "string" ),
		language: attr( "string" ),
		logo: attr( "string" ),
		mature: attr( "boolean" ),
		name: attr( "string" ),
		partner: attr( "boolean" ),
		profile_banner: attr( "string" ),
		profile_banner_background_color: attr( "string" ),
		staff: attr( "boolean" ),
		status: attr( "string" ),
		teams: hasMany( "twitchTeam" ),
		updated_at: attr( "date" ),
		url: attr( "string" ),
		video_banner: attr( "string" ),
		views: attr( "number" ),

		// Twitch.tv API bug?
		// Sometimes a user record (/user/:user - model not implemented) is embedded into
		// a stream record instead of a channels record (/channels/:channel - the current model).
		// We're defining the "missing" attributes, so that EmberData doesn't complain...
		bio: attr(),
		type: attr(),


		title_followers: function() {
			var followers = get( this, "followers" ),
			    numerus   = followers === 1 ? "person is" : "people are";
			return "%@ %@ following".fmt( followers, numerus );
		}.property( "followers" ),

		title_views: function() {
			var views   = get( this, "views" ),
			    numerus = views === 1 ? "view" : "views";
			return "%@ channel %@".fmt( views, numerus );
		}.property( "views" ),


		has_language: function() {
			var lang = get( this, "language" );
			return lang && lang !== "other";
		}.property( "language" ),

		has_broadcaster_language: function() {
			var broadcaster = get( this, "broadcaster_language" ),
			    language = get( this, "language" ),
			    m_broadcaster = re_lang.exec( broadcaster ),
			    m_language = re_lang.exec( language );
			// show the broadcaster_language only if it is set and
			// 1. the language is not set or
			// 2. the language is different from the broadcaster_language
			//    WITHOUT comparing both lang variants
			return m_broadcaster && ( !m_language || m_language[1] !== m_broadcaster[1] );
		}.property( "broadcaster_language", "language" ),


		/** @type {(TwitchUserSubscription|boolean)} subscribed */
		subscribed: null,

		/** @type {(TwitchUserFollowsChannel|boolean)} following */
		followed  : null

	}).reopenClass({
		toString: function() { return "kraken/channels"; }
	});

});
