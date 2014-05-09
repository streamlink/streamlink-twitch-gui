define( [ "ember", "models/Search" ], function( Ember, Search ) {

	return Ember.ObjectController.extend({
		filterlabel: function() {
			var filter = this.get( "filter" );
			return filter in Search.filtermap
				? Search.filtermap[ filter ].label
				: "All";
		}.property( "filter" ),

		notFiltered: function() {
			return this.get( "filter" ) === "all";
		}.property( "filter" ),

		noresults: function() {
			return	!this.get( "games" ).length
				&&	!this.get( "streams" ).length;
		}.property( "games", "streams" )
	});

});
