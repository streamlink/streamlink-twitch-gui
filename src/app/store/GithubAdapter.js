define([
	"Ember",
	"EmberData",
	"store/AdapterMixin"
], function( Ember, DS, AdapterMixin ) {

	return DS.RESTAdapter.extend( AdapterMixin, {
		host: "https://api.github.com",
		namespace: "repos/bastimeyer/livestreamer-twitch-gui"
	});

});
