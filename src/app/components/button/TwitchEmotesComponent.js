define([
	"Ember",
	"config",
	"nwjs/openBrowser",
	"components/button/FormButtonComponent"
], function(
	Ember,
	config,
	openBrowser,
	FormButtonComponent
) {

	var get = Ember.get;
	var and = Ember.computed.and;
	var or = Ember.computed.or;

	var twitchEmotesUrl = config.twitch[ "emotes-url" ];


	return FormButtonComponent.extend({
		settings: Ember.inject.service(),

		showButton: false,
		isEnabled : or( "showButton", "settings.content.gui_twitchemotes" ),
		isVisible : and( "isEnabled", "channel.partner" ),

		"class" : "btn-neutral",
		icon    : "fa-smile-o",
		iconanim: true,
		title   : "Show available channel emotes",

		action: "openTwitchEmotes",

		actions: {
			"openTwitchEmotes": function( success, failure ) {
				var url = twitchEmotesUrl;
				var channel = get( this, "channel.id" );

				if ( url && channel ) {
					url = url.replace( "{channel}", channel );
					openBrowser( url );
					success();

				} else {
					failure();
				}
			}
		}
	});

});
