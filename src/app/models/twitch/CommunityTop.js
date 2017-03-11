import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	avatar_image_url: attr( "string" ),
	channels: attr( "number" ),
	name: attr( "string" ),
	viewers: attr( "number" )

}).reopenClass({
	toString() { return "kraken/communities/top"; }
});
