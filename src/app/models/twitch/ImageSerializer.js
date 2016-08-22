import TwitchSerializer from "store/TwitchSerializer";


	export default TwitchSerializer.extend({
		normalize: function( modelClass, resourceHash, prop ) {
			// rename properties and ignore `template` property
			resourceHash.small_image = resourceHash.small;
			resourceHash.medium_image = resourceHash.medium;
			resourceHash.large_image = resourceHash.large;
			delete resourceHash.small;
			delete resourceHash.medium;
			delete resourceHash.large;
			delete resourceHash.template;

			return this._super( modelClass, resourceHash, prop );
		}
	});
