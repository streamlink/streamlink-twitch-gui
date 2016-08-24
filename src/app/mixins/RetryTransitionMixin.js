import Ember from "Ember";


var get = Ember.get;
var set = Ember.set;


export default Ember.Mixin.create({
	/**
	 * Retry a previously stored transition
	 * @param {string?} route
	 * @returns {Promise}
	 */
	retryTransition: function( route ) {
		var transition = get( this, "previousTransition" );

		if ( !transition ) {
			return route
				? this.transitionToRoute( route )
				: Promise.resolve();
		}

		set( this, "previousTransition", null );
		return transition.retry();
	}
});
