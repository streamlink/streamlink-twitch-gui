define([
	"Ember",
	"nwjs/nwGui",
	"components/FormButtonComponent"
], function(
	Ember,
	nwGui,
	FormButtonComponent
) {

	var get = Ember.get;
	var alias = Ember.computed.alias;

	return FormButtonComponent.extend({
		metadata: Ember.inject.service(),

		isVisible: alias( "channel.partner" ),

		"class" : "btn-neutral",
		icon    : "fa-smile-o",
		iconanim: true,
		title   : "Show available channel emotes",

		action: "openTwitchEmotes",

		actions: {
			"openTwitchEmotes": function( success, failure ) {
				var url = get( this, "metadata.config.twitch-emotes-url" );
				var channel = get( this, "channel.id" );

				if ( url && channel ) {
					url = url.replace( "{channel}", channel );
					nwGui.Shell.openExternal( url );
					success();

				} else {
					failure();
				}
			}
		}
	});

});
