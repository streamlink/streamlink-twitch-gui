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
		let streamprovider = get( this, "model.streamprovider" );
		if ( !streamprovider || !providers.hasOwnProperty( streamprovider ) ) {
			throw new Error( "Invalid stream provider" );
		}

		return providers[ streamprovider ].type === "streamlink";
	}),

	qualitiesLivestreamer,
	qualitiesStreamlink,
	qualities
});
