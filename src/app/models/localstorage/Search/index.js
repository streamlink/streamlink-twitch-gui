import {
	get,
	computed
} from "@ember/object";
import {
	attr,
	Model
} from "ember-data";


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
		{ label: "All", value: "all" },
		{ label: "Game", value: "games" },
		{ label: "Channel", value: "channels" },
		{ label: "Stream", value: "streams" }
	],

	filtersmap: computed(function() {
		return this.filters.reduce(function( map, filter ) {
			map[ filter.value ] = filter;
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
