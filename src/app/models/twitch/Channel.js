define( [ "Ember", "EmberData" ], function( Ember, DS ) {

	var get = Ember.get;
	var attr = DS.attr;
	var hasMany = DS.hasMany;

	var reLang = /^([a-z]{2})(:?-([a-z]{2}))?$/;


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


		title_followers: function() {
			var followers = get( this, "followers" );
			var numerus   = followers === 1 ? " person is following" : " people are following";
			return followers + numerus;
		}.property( "followers" ),

		title_views: function() {
			var views   = get( this, "views" );
			var numerus = views === 1 ? " channel view" : " channel views";
			return views + numerus;
		}.property( "views" ),


		has_language: function() {
			var lang = get( this, "language" );
			return lang && lang !== "other";
		}.property( "language" ),

		has_broadcaster_language: function() {
			var broadcaster  = get( this, "broadcaster_language" );
			var language     = get( this, "language" );
			var mBroadcaster = reLang.exec( broadcaster );
			var mLanguage    = reLang.exec( language );
			// show the broadcaster_language only if it is set and
			// 1. the language is not set or
			// 2. the language is different from the broadcaster_language
			//    WITHOUT comparing both lang variants
			return mBroadcaster && ( !mLanguage || mLanguage[1] !== mBroadcaster[1] );
		}.property( "broadcaster_language", "language" ),


		/** @type {(TwitchUserSubscription|boolean)} subscribed */
		subscribed: null,

		/** @type {(TwitchUserFollowsChannel|boolean)} following */
		followed  : null

	}).reopenClass({
		toString: function() { return "kraken/channels"; }
	});

});
