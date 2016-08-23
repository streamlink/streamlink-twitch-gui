import {
	get,
	computed
} from "Ember";
import { twitch } from "config";
import openBrowser from "nwjs/openBrowser";
import FormButtonComponent from "components/button/FormButtonComponent";
import TwitchInteractButtonMixin from "mixins/TwitchInteractButtonMixin";


const { alias, and } = computed;
const { subscription: { "create-url": subscriptionCreateUrl } } = twitch;


export default FormButtonComponent.extend( TwitchInteractButtonMixin, {
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
		return `You are subscribed to ${name}`;
	}.property( "name" ),
	titleFailure: function() {
		var name = get( this, "name" );
		return `Subscribe to ${name} now`;
	}.property( "name" ),


	actions: {
		"subscribe": function( success, failure ) {
			var url  = subscriptionCreateUrl;
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
