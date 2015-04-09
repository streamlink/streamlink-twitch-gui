define( [ "ember" ], function( Ember ) {

	return Ember.Controller.extend({
		stream : Ember.computed.alias( "model.stream" ),
		channel: Ember.computed.alias( "model.channel" )
	});

});
