define( [ "ember" ], function( Ember ) {

	return Ember.Controller.extend({
		filterlabel: function() {
			return this.store.modelFor( "search" ).getLabel( this.get( "filter" ) );
		}.property( "filter" ),

		notFiltered: Ember.computed.equal( "filter", "all" ),

		emptyGames: Ember.computed.empty( "games" ),
		emptyStreams: Ember.computed.empty( "streams" ),
		noresults: Ember.computed.and( "emptyGames", "emptyStreams" )
	});

});
