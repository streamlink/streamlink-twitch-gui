import {
	attr,
	belongsTo,
	Model
} from "ember-data";


export default Model.extend( {
	owner: belongsTo( "twitchChannel", { async: true } ),
	name: attr( "string" ),
	summary: attr( "string" ),
	description: attr( "string" ),
	rules: attr( "string" ),
	language: attr( "string" ),
	avatar_image_url: attr( "string" ),
	cover_image_url: attr( "string" )

}).reopenClass({
	toString() { return "kraken/communities"; }
});
