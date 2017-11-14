import {
	get,
	computed,
	inject,
	Component
} from "ember";
import {
	main as mainConfig
} from "config";
import { isDebug } from "nwjs/debug";
import layout from "templates/components/TitleBarComponent.hbs";


const { service } = inject;
const { "display-name": displayName } = mainConfig;


export default Component.extend({
	auth: service(),
	notification: service(),
	nwjs: service(),
	routing: service( "-routing" ),
	settings: service(),
	streaming: service(),

	layout,
	classNames: [ "title-bar-component" ],
	tagName: "header",

	displayName,
	isDebug,

	userTitle: computed(
		"auth.session.isLoggedIn",
		"auth.session.user_name",
		"notification.statusText",
		function() {
			if ( !get( this, "auth.session.isLoggedIn" ) ) {
				return "You're not logged in";
			}
			const user = get( this, "auth.session.user_name" );
			const notifications = get( this, "notification.statusText" );

			return `Logged in as ${user}\n${notifications}`;
		}
	),


	actions: {
		goto() {
			get( this, "routing" ).transitionTo( ...arguments );
		},

		homepage() {
			get( this, "routing" ).homepage();
		},

		nwjs( method ) {
			get( this, "nwjs" )[ method ]();
		}
	}
});
