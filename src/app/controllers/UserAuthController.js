define([
	"ember",
	"mixins/RetryTransitionMixin"
], function( Ember, RetryTransitionMixin ) {

	var get = Ember.get;

	return Ember.Controller.extend( RetryTransitionMixin, {
		auth: Ember.inject.service(),

		scope: function() {
			return get( this, "auth.scope" ).join( ", " );
		}.property( "auth.scope" )
	});

});
