define( [ "Ember" ], function( Ember ) {

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

		this.name   = "XMLHttpRequest Error";
		this.status = xhr.status;
		this.host   = xhr.host;
		this.path   = xhr.path;
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
			this._super.call( this, controller );

			model = model || new Error( "Unknown error" );
			model.name = model.name || model.constructor.name;

			var props  = [ "name", "message", "status", "host", "path" ],
			    reason = Ember.get( model, "reason" );

			// handle rejected promises with a passed Error object as reason
			if ( reason instanceof Error ) {
				model = reason;
			} else if ( reason !== undefined ) {
				props.push( "reason" );
			}

			// display the callstack of non-xhr errors
			if ( DEBUG && model instanceof Error && !( model instanceof Ember.XHRError ) ) {
				props.push( "stack" );
			}

			// create the error-content array
			controller.set( "model", props
				.filter(function( key ) {
					var value = model[ key ];
					return value !== undefined
					    && !( value instanceof Object )
					    && String( value ).trim().length > 0;
				})
				.map(function( key ) {
					return {
						key: key.charAt( 0 ).toUpperCase() + key.slice( 1 ),
						value: String( model[ key ] ),
						isStack: key === "stack"
					};
				})
			);
		}
	});

});
