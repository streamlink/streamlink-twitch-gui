import { attr } from "ember-data";
import { Fragment } from "model-fragments";


export default Fragment.extend({
	exec: attr( "string" ),
	params: attr( "string" ),
	pythonscript: attr( "string" )
});
