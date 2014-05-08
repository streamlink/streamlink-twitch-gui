define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		filters: [
			{ id: "searchfilter0", label: "All", value: "all" },
			{ id: "searchfilter1", label: "Game", value: "games" },
			{ id: "searchfilter2", label: "Stream", value: "streams" }
		],

		filterlabel: function() {
			var filter = this.get( "filter" );
			return this.filters.filter(function( elem ) {
				return elem.value === filter;
			})[0].label;
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
