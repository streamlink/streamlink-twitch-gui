import Ember from "Ember";
import DS from "EmberData";


	var get = Ember.get;
	var attr = DS.attr;


	export default DS.Model.extend({
		query : attr( "string" ),
		filter: attr( "string" ),
		date  : attr( "date" ),

		label: function() {
			var filter = get( this, "filter" );
			return this.constructor.getLabel( filter );
		}.property( "filter" )

	}).reopenClass({
		toString: function() { return "Search"; },

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

		getLabel: function( filter ) {
			var map = get( this, "filtersmap" );
			return map.hasOwnProperty( filter )
				? map[ filter ].label
				: "All";
		}
	});
