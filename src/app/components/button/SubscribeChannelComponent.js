define([
	"Ember",
	"nwjs/openBrowser",
	"components/button/FormButtonComponent",
	"mixins/TwitchInteractButtonMixin"
], function(
	Ember,
	openBrowser,
	FormButtonComponent,
	TwitchInteractButtonMixin
) {

	var get = Ember.get;
	var and = Ember.computed.and;
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

		isVisible: and( "isValid", "model.partner" ),

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
			return "You are subscribed to " + name;
		}.property( "name" ),
		titleFailure: function() {
			var name = get( this, "name" );
			return "Subscribe to " + name + " now";
		}.property( "name" ),


		actions: {
			"subscribe": function( success, failure ) {
				var url  = get( this, "metadata.config.twitch-subscribe-url" );
				var name = get( this, "id" );

				if ( url && name ) {
					url = url.replace( "{channel}", name );
					openBrowser( url );

					if ( success instanceof Function ) {
						success();
					}
				} else if ( failure instanceof Function ) {
					failure().catch();
				}
			}
		}
	});

});
