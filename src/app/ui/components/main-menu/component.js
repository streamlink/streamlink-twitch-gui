import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { classNames, layout, tagName } from "@ember-decorators/component";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import { hotkey, hotkeysNamespace } from "utils/decorators";
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
@hotkeysNamespace( "navigation" )
export default class MainMenuComponent extends Component.extend( HotkeyMixin ) {
	/** @type {RouterService} */
	@service router;

	@hotkey
	refresh() {
		// macOS has a menu bar with its own refresh hotkey
		if ( isDarwin ) { return; }
		this.router.refresh();
	}

	@hotkey
	historyBack() {
		this.router.history( -1 );
	}

	@hotkey
	historyForward() {
		this.router.history( +1 );
	}

	@hotkey
	homepage() {
		this.router.homepage();
	}
}


for ( const [ action, route ] of Object.entries( hotkeyActionRouteMap ) ) {
	/** @this {MainMenuComponent} */
	MainMenuComponent.prototype.hotkeys[ action ] = function() {
		this.router.transitionTo( route );
	};
}
