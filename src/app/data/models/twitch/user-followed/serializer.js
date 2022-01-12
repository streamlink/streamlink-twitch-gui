import TwitchSerializer from "data/models/twitch/serializer";


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-user-followed";
	},

	normalize( modelClass, resourceHash, prop ) {
		const { from_id, to_id } = resourceHash;
		resourceHash[ this.primaryKey ] = `${from_id}-${to_id}`;
		resourceHash[ "from" ] = from_id;
		resourceHash[ "to" ] = to_id;
		delete resourceHash[ "from_id" ];
		delete resourceHash[ "to_id" ];

		return this._super( modelClass, resourceHash, prop );
	}
});
