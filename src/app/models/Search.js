define( [ "ember", "ember-data" ], function( Ember, DS ) {

	var get = Ember.get;

	return DS.Model.extend({
		query		: DS.attr( "string" ),
		filter		: DS.attr( "string" ),
		date		: DS.attr( "number" ),

		label		: function() {
			return this.constructor.getLabel( get( this, "filter" ) );
		}.property( "filter" )

	}).reopenClass({
		toString: function() { return "Search"; },

		filters: [
			{ label: "All", value: "all" },
			{ label: "Game", value: "games" },
			{ label: "Stream", value: "streams" }

		].map(function( filter, i ) {
			filter.id = "searchfilter" + i;
			return filter;
		}),

		filtersmap: function() {
			return get( this, "filters" ).reduce(function( map, filter ) {
				map[ filter.value ] = filter;
				return map;
			}, {} );
		}.property( "filters" ),

		getLabel: function( filter ) {
			var map = get( this, "filtersmap" );
			return map.hasOwnProperty( filter )
				? map[ filter ].label
				: "All";
		}
	});

});
