import {
	get,
	computed
} from "ember";
import {
	attr,
	Model
} from "ember-data";
import { fragment } from "model-fragments";
import {
	players as playersConfig
} from "config";
import { isWin } from "utils/node/platform";


function defaultPlayerData() {
	return Object.keys( playersConfig )
		.map(function( player ) {
			let params = playersConfig[ player ][ "params" ]
				.reduce(function( obj, param ) {
					obj[ param.name ] = param.default;
					return obj;
				}, {} );

			return {
				key: player,
				exec: "",
				args: "",
				params: params
			};
		})
		.reduce( function( obj, player ) {
			obj[ player.key ] = player;
			delete player.key;
			return obj;
		}, {
			"default": {
				exec: "",
				args: ""
			}
		} );
}


/**
 * @class Settings
 */
export default Model.extend({
	advanced            : attr( "boolean", { defaultValue: false } ),
	streaming: fragment( "settingsStreaming", { defaultValue: {} } ),
	player              : attr( "",        { defaultValue: defaultPlayerData } ),
	player_preset       : attr( "string",  { defaultValue: "default" } ),
	gui_theme           : attr( "string",  { defaultValue: "default" } ),
	gui_smoothscroll    : attr( "boolean", { defaultValue: true } ),
	gui_externalcommands: attr( "boolean", { defaultValue: false } ),
	gui_integration     : attr( "number",  { defaultValue: 3 } ),
	gui_minimizetotray  : attr( "number",  { defaultValue: false } ),
	gui_minimize        : attr( "number",  { defaultValue: 0 } ),
	gui_focusrefresh    : attr( "number",  { defaultValue: 0 } ),
	gui_homepage        : attr( "string",  { defaultValue: "/featured" } ),
	gui_layout          : attr( "string",  { defaultValue: "tile" } ),
	streams: fragment( "settingsStreams", { defaultValue: {} } ),
	chat_method         : attr( "string",  { defaultValue: "default" } ),
	chat_command        : attr( "string",  { defaultValue: "" } ),
	notification: fragment( "settingsNotification", { defaultValue: {} } ),


	isVisibleInTaskbar: computed( "gui_integration", function() {
		return ( get( this, "gui_integration" ) & 1 ) > 0;
	}),

	isVisibleInTray: computed( "gui_integration", function() {
		return ( get( this, "gui_integration" ) & 2 ) > 0;
	})

}).reopenClass({

	toString() { return "Settings"; },

	// bitwise IDs: both & 1 && both & 2
	integration: [
		{ id: 3, label: "Both" },
		{ id: 1, label: "Taskbar" },
		{ id: 2, label: "Tray" }
	],

	minimize: [
		{ id: 0, label: "Do nothing" },
		{ id: 1, label: "Minimize" },
		{ id: 2, label: "Move to tray" }
	],

	gui_focusrefresh: [
		{ value:      0, label: "Don't refresh" },
		{ value:  60000, label: "After one minute" },
		{ value: 120000, label: "After two minutes" },
		{ value: 300000, label: "After five minutes" }
	],

	chat_methods: [
		// TODO: change to "browser"
		{ id: "default",  label: "Default Browser" },
		// TODO: change to "default"
		{ id: "irc",      label: "Internal IRC Client", disabled: true },
		{ id: "chromium", label: "Chromium" },
		{ id: "chrome",   label: "Google Chrome" },
		{ id: "msie",     label: "Internet Explorer", disabled: !isWin },
		{ id: "chatty",   label: "Chatty" },
		{ id: "custom",   label: "Custom application" }
	]
});
