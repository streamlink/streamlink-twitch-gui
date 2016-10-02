import {
	get,
	set,
	defineProperty,
	computed,
	inject,
	observer,
	Controller
} from "Ember";
import qualities from "models/LivestreamerQualities";
import RetryTransitionMixin from "mixins/RetryTransitionMixin";


const { service } = inject;


export default Controller.extend( RetryTransitionMixin, {
	modal: service(),
	settings: service(),

	qualities,

	modelObserver: observer( "model", function() {
		var original = get( this, "model.model" );
		var model    = get( this, "model.buffer" );
		var settings = get( this, "settings" );

		original.eachAttribute(function( attr, meta ) {
			var customDefault = meta.options.defaultValue;

			// proxy for setting the custom attr or getting the custom/global attr
			var attributeProxy = computed(
				`model.buffer.${attr}`,
				`settings.${attr}`,
				{
					set( key, value, oldValue ) {
						// don't accept changes if disabled
						// selectboxes without `null` options trigger property changes on insert
						if ( !get( this, `_${attr}` ) ) {
							return oldValue;
						}
						set( model, attr, value );
						return value;
					},
					get() {
						// return the global value if the custom value is null
						var val = get( model, attr );
						return val === customDefault
							? get( settings, attr )
							: val;
					}
				}
			);

			// computed property for enabling/disabling the custom attribute
			var attributeEnabled = computed(
				`model.buffer.${attr}`,
				{
					set( key, value ) {
						// false => set attr value to null (delete)
						// true  => set attr value to global value (init)
						value = !!value;
						set( model, attr, value
								? get( settings, attr )
								: null
						);
						return value;
					},
					get() {
						// false => use global attribute (default)
						// true  => use custom attribute
						return get( model, attr ) !== customDefault;
					}
				}
			);

			defineProperty( this,       attr, attributeProxy );
			defineProperty( this, `_${attr}`, attributeEnabled );
		}, this );
	}),

	/**
	 * Prevent pollution:
	 * Destroy all records that don't have custom values set, otherwise just save it normally
	 * @param record
	 * @param buffer
	 * @returns {Promise}
	 */
	saveRecord( record, buffer ) {
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
		apply( success, failure ) {
			var modal  = get( this, "modal" );
			var model  = get( this, "model.model" );
			var buffer = get( this, "model.buffer" ).applyChanges().getContent();
			this.saveRecord( model, buffer )
				.then( success, failure )
				.then( modal.closeModal.bind( modal, this ) )
				.then( this.retryTransition.bind( this ) )
				.catch( model.rollbackAttributes.bind( model ) );
		},

		discard( success ) {
			var modal = get( this, "modal" );
			get( this, "model.buffer" ).discardChanges();
			Promise.resolve()
				.then( success )
				.then( modal.closeModal.bind( modal, this ) )
				.then( this.retryTransition.bind( this ) );
		},

		cancel() {
			set( this, "previousTransition", null );
			get( this, "modal" ).closeModal( this );
		}
	}
});
