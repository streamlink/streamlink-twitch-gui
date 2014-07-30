define( [ "ember", "models/Search" ], function( Ember, Search ) {

	return Ember.ObjectController.extend({
		filterlabel: function() {
			var filter = this.get( "filter" );
			return filter in Search.filtermap
				? Search.filtermap[ filter ].label
				: "All";
		}.property( "filter" ),

		notFiltered: Ember.computed.equal( "filter", "all" ),

		emptyGames: Ember.computed.empty( "games" ),
		emptyStreams: Ember.computed.empty( "streams" ),
		noresults: Ember.computed.and( "emptyGames", "emptyStreams" )
	});

});
