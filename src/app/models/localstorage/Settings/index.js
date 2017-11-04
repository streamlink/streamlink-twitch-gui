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
	advanced: attr( "boolean", { defaultValue: false } ),
	gui: fragment( "settingsGui", { defaultValue: {} } ),
	streaming: fragment( "settingsStreaming", { defaultValue: {} } ),
	player              : attr( "",        { defaultValue: defaultPlayerData } ),
	player_preset       : attr( "string",  { defaultValue: "default" } ),
	streams: fragment( "settingsStreams", { defaultValue: {} } ),
	chat_method         : attr( "string",  { defaultValue: "default" } ),
	chat_command        : attr( "string",  { defaultValue: "" } ),
	notification: fragment( "settingsNotification", { defaultValue: {} } )

}).reopenClass({

	toString() { return "Settings"; },

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
