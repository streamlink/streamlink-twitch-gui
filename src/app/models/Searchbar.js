define( [ "ember", "ember-data", "models/Search" ], function( Ember, DS, Search ) {

	return DS.Model.extend({
		query		: DS.attr( "string" ),
		filter		: DS.attr( "string" ),
		date		: DS.attr( "number" ),

		label		: function() {
			var filter = this.get( "filter" );
			return filter in Search.filtermap
				? Search.filtermap[ filter ].label
				: "All";
		}.property( "filter" )

	}).reopenClass({
		toString: function() { return "Searchbar"; }
	});

});
