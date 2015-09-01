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

	return FormButtonComponent.extend({
		metadata: Ember.inject.service(),

		"class" : "btn-hint",
		icon    : "fa-comments",
		title   : "Open chat",
		iconanim: true,

		action: "chat",

		actions: {
			"chat": function( callback ) {
				var url  = get( this, "metadata.config.twitch-chat-url" );
				var name = get( this, "channel.id" );

				if ( url && name ) {
					url = url.replace( "{channel}", name );
					nwGui.Shell.openExternal( url );

					if ( callback instanceof Function ) {
						callback();
					}
				}
			}
		}
	});

});
