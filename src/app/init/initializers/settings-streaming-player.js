import { players } from "data/models/settings/streaming/player/fragment";
import Serializer from "data/models/settings/streaming/player/serializer";


export default {
	name: "settings-streaming-player",

	initialize( application ) {
		for ( const [ type, model ] of players ) {
			application.register( `model:settings-streaming-player-${type}`, model );
			application.register( `serializer:settings-streaming-player-${type}`, Serializer );
		}
	}
};
