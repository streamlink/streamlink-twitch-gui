import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	normalize( modelClass, resourceHash, prop ) {
		resourceHash.image_small = resourceHash.small;
		resourceHash.image_medium = resourceHash.medium;
		resourceHash.image_large = resourceHash.large;

		return this._super( modelClass, resourceHash, prop );
	}
});
