import Controller from "@ember/controller";
import { get, set, defineProperty, computed, action } from "@ember/object";
import { inject as service } from "@ember/service";
import { observes } from "@ember-decorators/object";
import { qualities } from "data/models/stream/model";
import RetryTransitionMixin from "ui/routes/-mixins/controllers/retry-transition";


export default class ChannelSettingsController extends Controller.extend( RetryTransitionMixin ) {
	/** @type {ModalService} */
	@service modal;
	/** @type {SettingsService} */
	@service settings;

	qualities = qualities;

	/** @type {{model: ChannelSettings, buffer: ObjectBuffer}} */
	model;

	@observes( "model" )
	modelObserver() {
		const { model: original, buffer: model } = this.model;
		const settings = this.settings;

		original.eachAttribute( ( attr, meta ) => {
			const {
				defaultValue: customDefault,
				settingsPath
			} = meta.options;

			// proxy for setting the custom attr or getting the custom/global attr
			const attributeProxy = computed(
				`model.buffer.${attr}`,
				`settings.${settingsPath}`,
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
						const val = get( model, attr );
						return val === customDefault
							? get( settings, settingsPath )
							: val;
					}
				}
			);

			// computed property for enabling/disabling the custom attribute
			const attributeEnabled = computed(
				`model.buffer.${attr}`,
				{
					set( key, value ) {
						// false => set attr value to null (delete)
						// true  => set attr value to global value (init)
						value = !!value;
						set( model, attr, value
							? get( settings, settingsPath )
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
		});
	}

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
		let isEmpty = true;
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
			record.deleteRecord();
			return record.save()
				.then(function() {
					// but return back to `root.loaded.created.uncommitted`.
					// At this point, the record has already been removed from the store, but
					// saving it again later will work just fine...
					record.transitionTo( "loaded.created.uncommitted" );
				});
		}
	}

	@action
	async apply( success, failure ) {
		const model = this.model.model;
		const buffer = this.model.buffer.applyChanges().getContent();

		try {
			await this.saveRecord( model, buffer );
			await success();
			this.modal.closeModal( this );
			this.retryTransition();

		} catch ( e ) {
			await failure();
			model.rollbackAttributes();
		}
	}

	@action
	async discard( success ) {
		this.model.buffer.discardChanges();
		await success();
		this.modal.closeModal( this );
		this.retryTransition();
	}

	@action
	cancel() {
		set( this, "previousTransition", null );
		this.modal.closeModal( this );
	}
}
