define([
	"Ember",
	"mixins/RetryTransitionMixin"
], function( Ember, RetryTransitionMixin ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Controller.extend( RetryTransitionMixin, {
		modelObserver: function() {
			var original = get( this, "model.model" );
			var model    = get( this, "model.buffer" );
			var settings = get( this, "settings" );

			original.eachAttribute(function( attr, meta ) {
				var customDefault = meta.options.defaultValue;

				// proxy for setting the custom attr or getting the custom/global attr
				var attributeProxy = Ember.computed(
					"model.buffer." + attr,
					"settings." + attr,
					function( key, value, oldValue ) {
						// old CP-setter syntax (as of ember 1.12.0)
						if ( arguments.length > 1 ) {
							// don't accept changes if disabled
							// selectboxes without `null` options trigger property changes on insert
							if ( !get( this, "_" + attr ) ) {
								return oldValue;
							}
							set( model, attr, value );
							return value;
						} else {
							// return the global value if the custom value is null
							var val = get( model, attr );
							return val === customDefault
								? get( settings, attr )
								: val;
						}
					}
				);

				// computed property for enabling/disabling the custom attribute
				var attributeEnabled = Ember.computed(
					"model.buffer." + attr,
					function( key, value ) {
						// old CP-setter syntax (as of ember 1.12.0)
						if ( arguments.length > 1 ) {
							// false => set attr value to null (delete)
							// true  => set attr value to global value (init)
							value = !!value;
							set( model, attr, value
								? get( settings, attr )
								: null
							);
							return value;
						} else {
							// false => use global attribute (default)
							// true  => use custom attribute
							return get( model, attr ) !== customDefault;
						}
					}
				);

				Ember.defineProperty( this,       attr, attributeProxy );
				Ember.defineProperty( this, "_" + attr, attributeEnabled );
			}, this );
		}.observes( "model" ),

		/**
		 * Prevent pollution:
		 * Destroy all records that don't have custom values set, otherwise just save it normally
		 * @param record
		 * @param buffer
		 * @returns {Promise}
		 */
		saveRecord: function( record, buffer ) {
			// apply the buffered changes
			record.setProperties( buffer );

			// check if the record has any values set
			var isEmpty = true;
			record.eachAttribute(function( attr, meta ) {
				if ( get( record, attr ) !== meta.options.defaultValue ) {
					isEmpty = false;
				}
			});

			if ( !isEmpty ) {
				// save the changes
				return record.save();

			} else if ( get( record, "isNew" ) ) {
				// don't do anything here
				return Promise.resolve();

			} else {
				// tell the adapter to remove the record
				return record.destroyRecord()
					.then(function() {
						// but return back to `root.loaded.created.uncommitted`.
						// At this point, the record has already been removed from the store, but
						// saving it again later will work just fine...
						record.transitionTo( "loaded.created.uncommitted" );
					});
			}
		},

		actions: {
			"apply": function( callback ) {
				var model  = get( this, "model.model" );
				var buffer = get( this, "model.buffer" ).applyChanges().getContent();
				this.saveRecord( model, buffer )
					.then( callback )
					.then( this.send.bind( this, "closeModal" ) )
					.then( this.retryTransition.bind( this ) )
					.catch( model.rollback.bind( model ) );
			},

			"discard": function( callback ) {
				get( this, "model.buffer" ).discardChanges();
				Promise.resolve()
					.then( callback )
					.then( this.send.bind( this, "closeModal" ) )
					.then( this.retryTransition.bind( this ) );
			}
		}
	});

});
