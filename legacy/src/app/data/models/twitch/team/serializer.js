import TwitchSerializer from "data/models/twitch/serializer";


const { hasOwnProperty } = {};


export default TwitchSerializer.extend({
	modelNameFromPayloadKey() {
		return "twitch-team";
	},

	normalize( modelClass, resourceHash, prop ) {
		// we only care about user_id values
		resourceHash[ "users" ] = ( resourceHash[ "users" ] /* istanbul ignore next */ || [] )
			.filter( user => user
				&& typeof user === "object"
				&& hasOwnProperty.call( user, "user_id" )
			)
			.map( user => user[ "user_id" ] );

		return this._super( modelClass, resourceHash, prop );
	}
});
