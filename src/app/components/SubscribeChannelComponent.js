define([
	"Ember",
	"nwjs/nwGui",
	"components/FormButtonComponent",
	"mixins/TwitchInteractButtonMixin"
], function(
	Ember,
	nwGui,
	FormButtonComponent,
	TwitchInteractButtonMixin
) {

	var get = Ember.get;
	var alias = Ember.computed.alias;

	return FormButtonComponent.extend( TwitchInteractButtonMixin, {
		metadata: Ember.inject.service(),

		modelName: "twitchUserSubscription",

		// model alias (component attribute)
		model    : alias( "channel" ),
		// save the data on the channel record instead of the component
		record   : alias( "channel.subscribed" ),
		// use the channel's display_name
		name     : alias( "channel.display_name" ),

		action: "subscribe",
		openBrowser: "openBrowser",

		classLoading: "btn-primary",
		classSuccess: "btn-success",
		classFailure: "btn-primary",
		iconLoading : "fa-credit-card",
		iconSuccess : "fa-credit-card",
		iconFailure : "fa-credit-card",
		titleLoading: "",
		titleSuccess: function() {
			var name = get( this, "name" );
			return "You are subscribed to %@".fmt( name );
		}.property( "name" ),
		titleFailure: function() {
			var name = get( this, "name" );
			return "Subscribe to %@ now".fmt( name );
		}.property( "name" ),


		actions: {
			"subscribe": function( callback ) {
				var url  = get( this, "metadata.config.twitch-subscribe-url" );
				var name = get( this, "id" );

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
