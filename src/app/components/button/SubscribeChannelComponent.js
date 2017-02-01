import {
	get,
	computed
} from "Ember";
import { twitch } from "config";
import { openBrowser } from "nwjs/Shell";
import FormButtonComponent from "components/button/FormButtonComponent";
import TwitchInteractButtonMixin from "mixins/TwitchInteractButtonMixin";
import HotkeyMixin from "mixins/HotkeyMixin";


const { alias, and } = computed;
const { subscription: { "create-url": subscriptionCreateUrl } } = twitch;


export default FormButtonComponent.extend( TwitchInteractButtonMixin, HotkeyMixin, {
	modelName: "twitchUserSubscription",

	// model alias (component attribute)
	model    : alias( "channel" ),
	// save the data on the channel record instead of the component
	record   : alias( "channel.subscribed" ),
	// use the channel's display_name
	name     : alias( "channel.display_name" ),

	isVisible: and( "isValid", "model.partner" ),

	classLoading: "btn-primary",
	classSuccess: "btn-success",
	classFailure: "btn-primary",
	iconLoading : "fa-credit-card",
	iconSuccess : "fa-credit-card",
	iconFailure : "fa-credit-card",
	titleLoading: "",
	titleSuccess: computed( "name", function() {
		let name = get( this, "name" );
		return `[S] Renew subscription to ${name}`;
	}),
	titleFailure: computed( "name", function() {
		let name = get( this, "name" );
		return `[S] Subscribe to ${name} now`;
	}),

	hotkeys: [
		{
			code: "KeyS",
			action() {
				this.click();
			}
		}
	],


	action() {
		let url = subscriptionCreateUrl;
		let channel = get( this, "id" );

		return openBrowser( url, {
			channel
		});
	}
});
