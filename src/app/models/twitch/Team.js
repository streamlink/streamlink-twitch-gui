import {
	get,
	computed
} from "Ember";
import {
	attr,
	hasMany,
	Model
} from "EmberData";


const reStripHTML = /<(?:.|\n)*?>/gm;


export default Model.extend({
	background: attr( "string" ),
	banner: attr( "string" ),
	created_at: attr( "date" ),
	display_name: attr( "string" ),
	info: attr( "string" ),
	logo: attr( "string" ),
	name: attr( "string" ),
	updated_at: attr( "date" ),
	users: hasMany( "twitchChannel", { async: false } ),


	title: computed( "name", "display_name", function() {
		return get( this, "display_name" )
		    || get( this, "name" );
	}),

	infoText: computed( "info", function() {
		const info = get( this, "info" ) || "";

		return info.replace( reStripHTML, "" );
	})

}).reopenClass({
	toString() { return "kraken/teams"; }
});
