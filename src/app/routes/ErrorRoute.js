define( [ "ember" ], function( Ember ) {

	/**
	 * Subclass of Ember.Error
	 * @param xhr
	 * @constructor
	 */
	Ember.XHRError = function( xhr ) {
		Ember.Error.call( this, xhr.statusText === "error"
			// display a friendlier message
			? "Failed to load resource"
			: xhr.statusText
		);

		this.name	= "XMLHttpRequest Error";
		this.xhr	= xhr;
	};

	Ember.XHRError.prototype = Ember.create( Ember.Error.prototype );


	return Ember.Route.extend({
		/**
		 * Do all the error display stuff here instead of using an error controller.
		 * A route for errors is needed anyway.
		 *
		 * @param controller
		 * @param {(Error|Ember.RSVP.Promise)} model
		 */
		setupController: function( controller, model ) {
			this._super.apply( this, arguments );

			var	props	= [ "name", "message" ],
				reason	= Ember.get( model, "reason" );

			// handle rejected promises with a passed Error object as reason
			if ( reason instanceof Error ) {
				model = reason;
			} else if ( reason !== undefined ) {
				props.push( "reason" );
			}

			// display the callstack of non-xhr errors
			if ( model instanceof Error && !( model instanceof Ember.XHRError ) ) {
				props.push( "stack" );
			}

			// create the error-content array
			controller.set( "error", props
				.filter(function( key ) {
					return model[ key ] !== undefined;
				})
				.map(function( key ) {
					return {
						key: key.charAt( 0 ).toUpperCase() + key.slice( 1 ),
						value: model[ key ],
						isStack: key === "stack"
					};
				})
			);

			// also log the error in dev mode
			if ( DEBUG && model.stack ) {
				console.error( model.stack );
			}
		}
	});

});
