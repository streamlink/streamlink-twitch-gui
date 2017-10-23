import {
	get,
	computed,
	Controller
} from "ember";
import {
	streaming as streamingConfig
} from "config";
import qualities, {
	qualitiesLivestreamer,
	qualitiesStreamlink
} from "models/stream/qualities";


const { providers } = streamingConfig;


export default Controller.extend({
	isStreamlink: computed( "model.streamprovider", function() {
		const provider = get( this, "model.streamprovider" );
		if ( !provider || !providers.hasOwnProperty( provider ) ) {
			throw new Error( "Invalid stream provider" );
		}

		return providers[ provider ].type === "streamlink";
	}),

	qualitiesLivestreamer,
	qualitiesStreamlink,
	qualities
});
