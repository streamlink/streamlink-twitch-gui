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
				accept		: "application/vnd.twitchtv.v3+json"
			},
			timeout		: 10000
		}) )
			.catch(function( jqErr ) {
				jqErr.host	= "api.twitch.tv";
				jqErr.path	= path;
				throw new Ember.XHRError( jqErr );
			});
	};

});
