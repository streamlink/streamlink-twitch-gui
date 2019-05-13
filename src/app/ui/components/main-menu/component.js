import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { classNames, layout, tagName } from "@ember-decorators/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import { isDarwin } from "utils/node/platform";
import template from "./template.hbs";
import "./styles.less";


const hotkeyActionRouteMap = {
	"routeAbout": "about",
	"routeWatching": "watching",
	"routeUserAuth": "user.auth",
	"routeSettings": "settings",
	"routeFeatured": "featured",
	"routeGames": "games",
	"routeStreams": "streams",
	"routeUserFollowedStreams": "user.followedStreams",
	"routeUserFollowedChannels": "user.followedChannels"
};


@layout( template )
@tagName( "aside" )
@classNames( "main-menu-component" )
export default class MainMenuComponent extends Component.extend( HotkeyMixin ) {
	/** @type {RouterService} */
	@service router;

	hotkeysNamespace = "navigation";
	hotkeys = {
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
}
