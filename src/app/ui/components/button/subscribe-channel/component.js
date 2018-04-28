import { get, computed } from "@ember/object";
import { alias, and } from "@ember/object/computed";
import { twitch } from "config";
import { openBrowser } from "nwjs/Shell";
import FormButtonComponent from "../form-button/component";
import TwitchInteractButtonMixin from "ui/components/-mixins/twitch-interact-button";
import HotkeyMixin from "ui/components/-mixins/hotkey";


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

	_title: computed( "i18n.locale", "isLoading", "isSuccessful", "name", function() {
		if ( get( this, "isLoading" ) ) {
			return "";
		}

		const i18n = get( this, "i18n" );
		const key = get( this, "isSuccessful" )
			? "components.subscribe-channel.title-renew"
			: "components.subscribe-channel.title-new";
		const name = get( this, "name" );

		return i18n.t( key, { name } ).toString();
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
