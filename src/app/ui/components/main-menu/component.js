import Component from "@ember/component";
import { inject as service } from "@ember/service";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import { isDarwin } from "utils/node/platform";
import layout from "./template.hbs";
import "./styles.less";


const hotkeyActionRouteMap = {
	"routeAbout": "about",
	"routeWatching": "watching",
	"routeUserAuth": "user.auth",
	"routeSettings": "settings",
	"routeGames": "games",
	"routeStreams": "streams",
	"routeUserFollowedStreams": "user.followedStreams",
	"routeUserFollowedChannels": "user.followedChannels"
};


export default Component.extend( HotkeyMixin, /** @class MainMenuComponent */ {
	/** @type {RouterService} */
	router: service(),

	layout,

	classNames: [ "main-menu-component" ],
	tagName: "aside",

	hotkeysNamespace: "navigation",
	hotkeys: {
		/** @this {MainMenuComponent} */
		refresh() {
			// macOS has a menu bar with its own refresh hotkey
			if ( isDarwin ) { return; }
			this.router.refresh();
		},
		/** @this {MainMenuComponent} */
		historyBack() {
			this.router.history( -1 );
		},
		/** @this {MainMenuComponent} */
		historyForward() {
			this.router.history( +1 );
		},
		/** @this {MainMenuComponent} */
		homepage() {
			this.router.homepage();
		},
		...Object.entries( hotkeyActionRouteMap )
			.reduce( ( obj, [ action, route ]) => Object.assign( obj, {
				/** @this {MainMenuComponent} */
				[ action ]() {
					this.router.transitionTo( route );
				}
			}), {} )
	}
});
