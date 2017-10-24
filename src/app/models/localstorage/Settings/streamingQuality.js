import { attr } from "ember-data";
import { Fragment } from "model-fragments";


export default Fragment.extend({
	quality: attr( "string" ),
	exclude: attr( "string" )
});
