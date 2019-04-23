import TwitchSerializer from "data/models/twitch/serializer";


export default class TwitchImageSerializer extends TwitchSerializer {
	normalize( modelClass, resourceHash, prop ) {
		resourceHash.image_small = resourceHash.small;
		resourceHash.image_medium = resourceHash.medium;
		resourceHash.image_large = resourceHash.large;

		return super.normalize( modelClass, resourceHash, prop );
	}
}
