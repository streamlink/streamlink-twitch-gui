import {
	attr,
	Model
} from "ember-data";


export default Model.extend({
	avatar_image_url: attr( "string" ),
	channels: attr( "number" ),
	name: attr( "string" ),
	viewers: attr( "number" )

}).reopenClass({
	toString() { return "kraken/communities/top"; }
});
