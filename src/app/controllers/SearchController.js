define( [ "ember" ], function( Ember ) {

	var get = Ember.get;

	return Ember.Controller.extend({
		games   : Ember.computed.alias( "model.games" ),
		streams : Ember.computed.alias( "model.streams" ),
		channels: Ember.computed.alias( "model.channels" ),

		filterlabel: function() {
			var filter      = get( this, "filter" );
			var SearchModel = this.store.modelFor( "search" );
			return SearchModel.getLabel( filter );
		}.property( "filter" ),

		notFiltered: Ember.computed.equal( "filter", "all" ),

		emptyGames   : Ember.computed.empty( "games" ),
		emptyStreams : Ember.computed.empty( "streams" ),
		emptyChannels: Ember.computed.empty( "channels" ),

		noResults: function() {
			return get( this, "emptyGames" )
			    && get( this, "emptyStreams" )
			    && get( this, "emptyChannels" );
		}.property( "emptyGames", "emptyStreams", "emptyChannels" )
	});

});
