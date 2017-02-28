import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	display_order: attr( "number" ),
	html_description: attr( "string" ),
	image: attr( "string" ),
	kind: attr( "string" ),
	link: attr( "string" ),
	title: attr( "string" )

}).reopenClass({
	toString() { return "api/channels/:channel/panels"; }
});
