import { Application } from "ember";
import { players } from "models/localstorage/Settings/streamingPlayer";
import Serializer from "models/localstorage/Settings/streamingPlayerSerializer";


Application.initializer({
	name: "settings-streaming-player",

	initialize( application ) {
		for ( const [ type, model ] of players ) {
			application.register( `model:settings-streaming-player-${type}`, model );
			application.register( `serializer:settings-streaming-player-${type}`, Serializer );
		}
	}
});
