import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { players as playersConfig } from "config";


const typeKey = "type";
const players = new Map();


const SettingsStreamingPlayer = Fragment.extend({
	exec: attr( "string" ),
	args: attr( "string" )
});


for ( const [ id, { params } ] of Object.entries( playersConfig ) ) {
	const attributes = {};
	for ( const { name, type, default: defaultValue } of params ) {
		attributes[ name ] = attr( type, { defaultValue } );
	}
	const player = SettingsStreamingPlayer.extend( attributes );
	players.set( id, player );
}


export {
	typeKey,
	players,
	SettingsStreamingPlayer as default
};
