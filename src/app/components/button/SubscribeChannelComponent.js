import {
	get,
	computed
} from "ember";
import { twitch } from "config";
import { openBrowser } from "nwjs/Shell";
import FormButtonComponent from "components/button/FormButtonComponent";
import TwitchInteractButtonMixin from "../mixins/twitch-interact-button";
import HotkeyMixin from "../mixins/hotkey";


const { alias, and } = computed;
const { subscription: { "create-url": subscriptionCreateUrl } } = twitch;


export default FormButtonComponent.extend( TwitchInteractButtonMixin, HotkeyMixin, {
	modelName: "twitchSubscription",

	// model alias (component attribute)
	model    : alias( "channel" ),
	// save the data on the channel record instead of the component
	record   : alias( "channel.subscribed" ),
	// use the channel's display_name
	name     : alias( "channel.display_name" ),

	isVisible: and( "isValid", "model.partner" ),

	classNameBindings: [ "_class" ],

	classLoading: "btn-primary",
	classSuccess: "btn-success",
	classFailure: "btn-primary",
	iconLoading : "fa-credit-card",
	iconSuccess : "fa-credit-card",
	iconFailure : "fa-credit-card",
	titleLoading: "",
	titleSuccess: computed( "name", function() {
		let name = get( this, "name" );
		return `Renew subscription to ${name}`;
	}),
	titleFailure: computed( "name", function() {
		let name = get( this, "name" );
		return `Subscribe to ${name} now`;
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
		let channel = get( this, "model.name" );

		return openBrowser( url, {
			channel
		});
	}
});
