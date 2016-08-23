import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	title: attr( "string" ),
	image: attr( "string" ),
	link: attr( "string" ),
	//description: attr( "string" ),
	html_description: attr( "string" ),
	kind: attr( "string" ),
	display_order: attr( "number" )
});
