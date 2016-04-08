define([
	"Ember"
], function(
	Ember
) {

	var get = Ember.get;
	var alias = Ember.computed.alias;
	var empty = Ember.computed.empty;
	var equal = Ember.computed.equal;


	return Ember.Controller.extend({
		games   : alias( "model.games" ),
		streams : alias( "model.streams" ),
		channels: alias( "model.channels" ),

		filterlabel: function() {
			var filter      = get( this, "filter" );
			var SearchModel = this.store.modelFor( "search" );
			return SearchModel.getLabel( filter );
		}.property( "filter" ),

		notFiltered: equal( "filter", "all" ),

		emptyGames   : empty( "games" ),
		emptyStreams : empty( "streams" ),
		emptyChannels: empty( "channels" ),

		noResults: function() {
			return get( this, "emptyGames" )
			    && get( this, "emptyStreams" )
			    && get( this, "emptyChannels" );
		}.property( "emptyGames", "emptyStreams", "emptyChannels" )
	});

});
