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


export default class SettingsPlayerController extends Controller {
	/** @type {I18nService} */
	@service i18n;
	/** @type {DS.Store} */
	@service store;

	substitutionsPlayer = substitutionsPlayer;

	// filter platform dependent player parameters
	@computed()
	get players() {
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
	}

	@computed()
	get contentStreamingPlayer() {
		const presets = [{
			id: "default",
			label: this.i18n.t( "settings.player.players.default.label" ).toString()
		}];
		for ( const [ id, { exec, disabled } ] of Object.entries( playersConfig ) ) {
			if ( disabled || !exec[ platform ] ) { continue; }
			// TODO: remove label property after rewriting DropDownComponent
			presets.push({ id, label: id });
		}

		return presets;
	}

	@computed( "i18n.locale", "model.streaming.player" )
	get playerPlaceholder() {
		const player = get( this, "model.streaming.player" );
		if ( player === "default" || !playersConfig[ player ] ) {
			return this.i18n.t( "settings.player.executable.default.placeholder" ).toString();
		}

		const exec = playersConfig[ player ][ "exec" ][ platform ];
		if ( !exec ) {
			return this.i18n.t( "settings.player.executable.preset.placeholder" ).toString();
		}

		return isArray( exec )
			? exec.join( `${delimiter} ` )
			: exec;
	}

	@equal( "model.streaming.player", "default" )
	playerPresetDefault;

	@computed( "playerPresetDefault", "model.streaming.players.default.exec" )
	get playerPresetDefaultAndPlayerEmpty() {
		return this.playerPresetDefault
		    && !get( this, "model.streaming.players.default.exec" );
	}
}
