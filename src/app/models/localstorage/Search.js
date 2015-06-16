define( [ "Ember", "EmberData" ], function( Ember, DS ) {

	var get = Ember.get;

	return DS.Model.extend({
		query : DS.attr( "string" ),
		filter: DS.attr( "string" ),
		date  : DS.attr( "date" ),

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

});
