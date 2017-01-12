import {
	get,
	computed,
	inject
} from "Ember";
import { twitch } from "config";
import { openBrowser } from "nwjs/Shell";
import FormButtonComponent from "components/button/FormButtonComponent";


const { and, or } = computed;
const { service } = inject;
const { "emotes-url": twitchEmotesUrl } = twitch;


export default FormButtonComponent.extend({
	settings: service(),

	showButton: false,
	isEnabled : or( "showButton", "settings.content.gui_twitchemotes" ),
	isVisible : and( "isEnabled", "channel.partner" ),

	classNames: [ "btn-neutral" ],
	icon: "fa-smile-o",
	iconanim: true,
	title: "Show available channel emotes",

	action() {
		let url = twitchEmotesUrl;
		let channel = get( this, "channel.id" );

		if ( url && channel ) {
			url = url.replace( "{channel}", channel );
			openBrowser( url );
			return Promise.resolve();
		}

		return Promise.reject();
	}
});
