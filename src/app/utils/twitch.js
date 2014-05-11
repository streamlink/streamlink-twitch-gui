define( [ "ember" ], function( Ember ) {

	/**
	 * Get data from twitch.tv
	 * @param {string} path
	 * @param {Object} [params]
	 * @returns {Ember.RSVP.Promise}
	 */
	return function twitch( path, params ) {
		params = params
			? "?" + Ember.$.param( params )
			: "";

		return Ember.RSVP.Promise.cast( Ember.$.ajax({
			dataType	: "json",
			url			: "https://api.twitch.tv/kraken/" + path + params,
			headers		: {
				accept		: "application/vnd.twitchtv.v2+json"
			},
			timeout		: 10000
		}) );
	};

});


// ----------
// /games/top
// ----------

/**
 * @typedef {TwitchTopGames} TwitchTopGames
 * @property {Object} _links
 * @property {string} _links.self
 * @property {string} _links.next
 * @property {int} _total
 * @property {TwitchGame[]} top
 */

/**
 * @typedef {TwitchGame} TwitchGame
 * @property {TwitchGameInfo} game
 * @property {int} viewers
 * @property {int} channels
 */

/**
 * @typedef {TwitchGameInfo} TwitchGameInfo
 * @property {string} name
 * @property {TwitchGameInfoImages} box
 * @property {TwitchGameInfoImages} logo
 * @property {Object<string,string>} _links
 * @property {int} _id
 * @property {int} giantbomb_id
 */

/**
 * @typedef {TwitchGameInfoImages} TwitchGameInfoImages
 * @property {string} large
 * @property {string} medium
 * @property {string} small
 * @property {string} template
 */


// ----------
// /streams/:game
// ----------

/**
 * @typedef {TwitchStreams} TwitchStreams
 * @property {TwitchStream[]} streams
 * @property {Object} _links
 * @property {string} _links.summary
 * @property {string} _links.followed
 * @property {string} _links.next
 * @property {string} _links.featured
 * @property {string} _links.self
 */

/**
 * @typedef {TwitchStream} TwitchStream
 * @property {string} broadcaster
 * @property {int} _id
 * @property {string} preview
 * @property {string} game
 * @property {TwitchChannel} channel
 * @property {string} name
 * @property {int} viewers
 * @property {Object} _links
 * @property {string} _links.self
 */

/**
 * @typedef {TwitchChannel} TwitchChannel
 * @property {boolean?} mature
 * @property {string} background
 * @property {string} updated_at
 * @property {int} _id
 * @property {string} status
 * @property {string} logo
 * @property {TwitchTeam[]} teams
 * @property {string} url
 * @property {string} display_name
 * @property {string} game
 * @property {string} banner
 * @property {string} name
 * @property {string?} video_banner
 * @property {Object} _links
 * @property {string} _links.chat
 * @property {string} _links.subscriptions
 * @property {string} _links.features
 * @property {string} _links.commercial
 * @property {string} _links.stream_key
 * @property {string} _links.editors
 * @property {string} _links.videos
 * @property {string} _links.self
 * @property {string} _links.follows
 */

/**
 * @typedef {TwitchTeam} TwitchTeam
 */
