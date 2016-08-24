import TwitchSerializer from "store/TwitchSerializer";


export default TwitchSerializer.extend({
	normalize: function( modelClass, resourceHash, prop ) {
		if ( resourceHash ) {
			var data = resourceHash.data;
			// flatten the record
			if ( data ) {
				resourceHash.title = data.title;
				resourceHash.image = data.image;
				resourceHash.link = data.link;
				//resourceHash.description = data.description;
				delete resourceHash.data;
			}
			delete resourceHash.user_id;
			delete resourceHash.channel;
		}

		return this._super( modelClass, resourceHash, prop );
	}
});
