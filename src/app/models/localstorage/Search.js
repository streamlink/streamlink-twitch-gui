import { get } from "Ember";
import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	query : attr( "string" ),
	filter: attr( "string" ),
	date  : attr( "date" ),

	label: function() {
		var filter = get( this, "filter" );
		return this.constructor.getLabel( filter );
	}.property( "filter" )

}).reopenClass({
	toString() { return "Search"; },

	filters: [
		{ label: "All", value: "all" },
		{ label: "Game", value: "games" },
		{ label: "Channel", value: "channels" },
		{ label: "Stream", value: "streams" }
	],

	filtersmap: function() {
		return this.filters.reduce(function( map, filter ) {
			map[ filter.value ] = filter;
			return map;
		}, {} );
	}.property(),

	getLabel( filter ) {
		var map = get( this, "filtersmap" );
		return map.hasOwnProperty( filter )
			? map[ filter ].label
			: "All";
	}
});
