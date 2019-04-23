import { defineProperty } from "@ember/object";
import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { players as playersConfig } from "config";


const typeKey = "type";
const players = new Map();


// the players share a few common attributes
class SettingsStreamingPlayer extends Fragment {
	@attr( "string" )
	exec;
	@attr( "string" )
	args;
}


for ( const [ id, { params } ] of Object.entries( playersConfig ) ) {
	const player = class extends SettingsStreamingPlayer {};

	for ( const { name, type, default: defaultValue } of params ) {
		const prop = attr( type, { defaultValue } );
		defineProperty( player.prototype, name, prop );
	}

	players.set( id, player );
}


export {
	typeKey,
	players,
	SettingsStreamingPlayer as default
};
