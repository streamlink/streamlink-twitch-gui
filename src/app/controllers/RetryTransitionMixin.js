define( [ "ember" ], function( Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Mixin.create({
		/**
		 * Retry a previously stored transition
		 * @param {string?}  transitionTo
		 * @param {boolean?} closeModal
		 * @returns {Promise}
		 */
		retryTransition: function( transitionTo, closeModal ) {
			var transition = get( this, "previousTransition" );

			if ( closeModal ) {
				this.send( "closeModal" );
			}

			if ( !transition ) {
				return transitionTo
					? this.transitionTo( transitionTo )
					: Promise.resolve();
			}

			set( this, "previousTransition", null );
			return transition.retry();
		}
	});

});
