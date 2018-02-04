import attr from "ember-data/attr";
import { Fragment } from "model-fragments";


export default Fragment.extend({
	quality: attr( "string" ),
	exclude: attr( "string" )
});
