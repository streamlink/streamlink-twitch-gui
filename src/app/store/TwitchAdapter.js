define([
	"ember",
	"ember-data",
	"store/AdapterMixin"
], function( Ember, DS, AdapterMixin ) {

	return DS.RESTAdapter.extend( AdapterMixin, {
		host: "https://api.twitch.tv",
		namespace: "kraken",
		headers: {
			Accept: "application/vnd.twitchtv.v3+json"
		},

		defaultSerializer: "twitch"
	});

});
