import { get, computed } from "@ember/object";
import attr from "ember-data/attr";
import Model from "ember-data/model";


export default Model.extend({
	query : attr( "string" ),
	filter: attr( "string" ),
	date  : attr( "date" ),

	label: computed( "filter", function() {
		const filter = get( this, "filter" );
		return this.constructor.getLabel( filter );
	})

}).reopenClass({
	toString() { return "Search"; },

	filters: [
		{ label: "All", id: "all" },
		{ label: "Game", id: "games" },
		{ label: "Channel", id: "channels" },
		{ label: "Stream", id: "streams" }
	],

	filtersmap: computed(function() {
		return this.filters.reduce( ( map, filter ) => {
			map[ filter.id ] = filter;
			return map;
		}, {} );
	}),

	getLabel( filter ) {
		const map = get( this, "filtersmap" );
		return map.hasOwnProperty( filter )
			? map[ filter ].label
			: "All";
	}
});
