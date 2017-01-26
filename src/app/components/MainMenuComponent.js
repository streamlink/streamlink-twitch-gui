import {
	get,
	inject,
	Component
} from "Ember";
import HotkeyMixin from "mixins/HotkeyMixin";
import { isDarwin } from "utils/node/platform";
import layout from "templates/components/MainMenuComponent.hbs";


const { service } = inject;


const routeHotkeys = {
	"about": "F1",
	"watching": "F10",
	"user.auth": "F11",
	"settings": "F12",
	"featured": [ "Numpad1", "Digit1" ],
	"games": [ "Numpad2", "Digit2" ],
	"channels": [ "Numpad3", "Digit3" ],
	"user.subscriptions": [ "Numpad4", "Digit4" ],
	"user.followedStreams": [ "Numpad5", "Digit5" ],
	"user.hostedStreams": [ "Numpad6", "Digit6" ],
	"user.followedChannels": [ "Numpad7", "Digit7" ],
	"user.followedGames": [ "Numpad8", "Digit8" ]
};

function refresh() {
	// MacOS has its menubar with its own refresh hotkey
	if ( isDarwin ) { return; }
	get( this, "routing" ).refresh();
}


export default Component.extend( HotkeyMixin, {
	routing: service( "-routing" ),

	layout,

	classNames: [ "main-menu-component" ],
	tagName: "aside",

	hotkeys: [
		{
			code: "F5",
			action: refresh
		},
		{
			code: "KeyR",
			ctrlKey: true,
			action: refresh
		},
		{
			code: "ArrowLeft",
			altKey: true,
			action() {
				get( this, "routing" ).history( -1 );
			}
		},
		{
			code: "ArrowRight",
			altKey: true,
			action() {
				get( this, "routing" ).history( +1 );
			}
		},
		{
			code: [ "Digit0", "Numpad0" ],
			action() {
				get( this, "routing" ).homepage();
			}
		},
		...Object.keys( routeHotkeys ).map( route => ({
			code: routeHotkeys[ route ],
			action() {
				get( this, "routing" ).transitionTo( route );
			}
		}) )
	]
});
