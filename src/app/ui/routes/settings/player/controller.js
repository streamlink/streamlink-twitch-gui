import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { equal } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { players as playersConfig } from "config";
import substitutionsPlayer from "services/streaming/player/substitutions";
import { platform } from "utils/node/platform";
import { delimiter } from "path";


const { assign } = Object;
const { isArray } = Array;


export default Controller.extend({
	i18n: service(),
	store: service(),

	substitutionsPlayer,

	// filter platform dependent player parameters
	players: computed(function() {
		const list = {};
		for ( const [ id, player ] of Object.entries( playersConfig ) ) {
			const obj = list[ id ] = assign( {}, player );
			obj.params = obj.params
				.map( param => {
					param = assign( {}, param );
					if ( param.args instanceof Object ) {
						param.args = param.args[ platform ];
					}

					return param;
				})
				.filter( param => !!param.args );
		}

		return list;
	}),

	contentStreamingPlayer: computed(function() {
		const i18n = get( this, "i18n" );

		const presets = [{
			id: "default",
			label: i18n.t( "settings.player.players.default.label" ).toString()
		}];
		for ( const [ id, { exec, disabled } ] of Object.entries( playersConfig ) ) {
			if ( disabled || !exec[ platform ] ) { continue; }
			// TODO: remove label property after rewriting DropDownComponent
			presets.push({ id, label: id });
		}

		return presets;
	}),

	playerPlaceholder: computed( "i18n.locale", "model.streaming.player", function() {
		const i18n = get( this, "i18n" );

		const player = get( this, "model.streaming.player" );
		if ( player === "default" || !playersConfig[ player ] ) {
			return i18n.t( "settings.player.executable.default.placeholder" ).toString();
		}

		const exec = playersConfig[ player ][ "exec" ][ platform ];
		if ( !exec ) {
			return i18n.t( "settings.player.executable.preset.placeholder" ).toString();
		}

		return isArray( exec )
			? exec.join( `${delimiter} ` )
			: exec;
	}),

	playerPresetDefault: equal( "model.streaming.player", "default" ),

	playerPresetDefaultAndPlayerEmpty: computed(
		"playerPresetDefault",
		"model.streaming.players.default.exec",
		function() {
			return get( this, "playerPresetDefault" )
			    && !get( this, "model.streaming.players.default.exec" );
		}
	)
});
