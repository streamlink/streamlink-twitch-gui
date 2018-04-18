import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import { isDarwin } from "utils/node/platform";
import layout from "./template.hbs";
import "./styles.less";


const { isArray } = Array;


const routeHotkeys = {
	"about": "F1",
	"watching": "F10",
	"user.auth": "F11",
	"settings": "F12",
	"featured": [ "Numpad1", "Digit1" ],
	"games": [ "Numpad2", "Digit2" ],
	"communities": [ "Numpad3", "Digit3" ],
	"streams": [ "Numpad4", "Digit4" ],
	"user.subscriptions": [ "Numpad5", "Digit5" ],
	"user.followedStreams": [ "Numpad6", "Digit6" ],
	"user.hostedStreams": [ "Numpad7", "Digit7" ],
	"user.followedChannels": [ "Numpad8", "Digit8" ],
	"user.followedGames": [ "Numpad9", "Digit9" ]
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
			force: true,
			action: refresh
		},
		{
			code: "KeyR",
			ctrlKey: true,
			force: true,
			action: refresh
		},
		{
			code: "ArrowLeft",
			altKey: true,
			force: true,
			action() {
				get( this, "routing" ).history( -1 );
			}
		},
		{
			code: "ArrowRight",
			altKey: true,
			force: true,
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
			force: !isArray( routeHotkeys[ route ] ),
			action() {
				get( this, "routing" ).transitionTo( route );
			}
		}) )
	]
});
