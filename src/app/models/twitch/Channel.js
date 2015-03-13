define( [ "ember", "ember-data" ], function( Ember, DS ) {

	var get = Ember.get,
	    re_lang = /^([a-z]{2})(:?-([a-z]{2}))?$/;

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
		staff: DS.attr( "boolean" ),
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
		type: DS.attr(),


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
		subscribed        : false,
		isSubscribed      : Ember.computed.bool( "subscribed" ),

		/** @type {(TwitchUserFollowsChannel|boolean)} following */
		following         : null,
		isFollowing       : Ember.computed.bool( "following" ),
		isFollowingLoading: Ember.computed.equal( "following", null ),
		isFollowingLocked : false

	}).reopenClass({
		toString: function() { return "channels"; }
	});

});
