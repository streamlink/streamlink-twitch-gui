import { get, computed } from "@ember/object";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { hasMany } from "ember-data/relationships";


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
	})

}).reopenClass({
	toString() { return "kraken/teams"; }
});
