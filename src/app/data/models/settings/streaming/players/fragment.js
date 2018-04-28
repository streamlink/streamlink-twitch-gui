import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { players as playersConfig } from "config";
import { typeKey } from "../player/fragment";


const attributes = {
	"default": fragment( "settings-streaming-player", { defaultValue: {} } )
};
for ( const [ type ] of Object.entries( playersConfig ) ) {
	attributes[ type ] = fragment( "settings-streaming-player", {
		defaultValue: {
			[ typeKey ]: `settings-streaming-player-${type}`
		},
		polymorphic: true,
		typeKey
	});
}


export default Fragment.extend( attributes );
