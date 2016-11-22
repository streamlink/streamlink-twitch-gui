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

	"class" : "btn-neutral",
	icon    : "fa-smile-o",
	iconanim: true,
	title   : "Show available channel emotes",

	action: "openTwitchEmotes",

	actions: {
		openTwitchEmotes( success, failure ) {
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
