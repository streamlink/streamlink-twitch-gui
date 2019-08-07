import Model from "ember-data/model";
import Store from "ember-data/store";


const { assign } = Object;


/*
 * Make EmberData unload records after destroying them.
 * This is important when trying to create a new record with the same ID after destroying a previous
 * one and has unfortunately been broken in EmberData since a very long time and is still not fixed.
 * There are a lot of related issues, like the destruction of relationship attributes, etc:
 * https://github.com/emberjs/data/issues/5006
 * https://github.com/emberjs/data/issues/5014
 * https://github.com/emberjs/data/pull/6147#issuecomment-501896335
 * https://github.com/emberjs/data/blob/v3.9.0/addon/-private/system/model/internal-model.ts#L488-L511
 *
 * As a future reminder for myself:
 * This "bugfix" is also the reason why certain serializers are explicitly removing relationship
 *   attributes now from the payload when creating records. See Twitch{Channel,Game}Followed.
 *   Without the serializer workarounds, this destroyRecord "bugfix" will cause the related
 *   tests to fail during the destruction of the test context's owner and store.
 */
Model.reopen({
	async destroyRecord() {
		const ret = await this._super( ...arguments );
		this.unloadRecord();
		this._internalModel.destroySync();

		return ret;
	}
});


// no initializer here: just upgrade the application store
Store.reopen({
	/**
	 * Find a record and unload the generated record
	 * @param {string} modelName
	 * @param {string|number} id
	 * @param {Object?} options
	 * @param {boolean?} options.reload
	 * @returns {Promise.<Model>}
	 */
	findExistingRecord( modelName, id, options ) {
		options = assign( { reload: true }, options );

		return this.findRecord( modelName, id, options )
			.catch( err => {
				// unload the generated empty record
				const record = this.peekRecord( modelName, id );

				if ( record ) {
					this.unloadRecord( record );
				}

				return Promise.reject( err );
			});
	},

	/**
	 * Look for an already existing record and avoid automatically generating an empty one.
	 * Instead, create a new one manually if no record was found.
	 * Use Ember's RSVP promises instead of normal promises / async functions.
	 * @param {String} modelName
	 * @param {(Number|String)} id
	 * @returns {Promise.<Model>}
	 */
	findOrCreateRecord( modelName, id = 1 ) {
		return this.findAll( modelName )
			.then( recordArray => recordArray.content.length
				? recordArray.objectAt( 0 )
				: this.createRecord( modelName, { id } ).save()
			);
	},

	query() {
		return this._super( ...arguments )
			.then( recordArray => {
				recordArray._unregisterFromManager();
				return recordArray;
			});
	}
});


export default {
	name: "ember-data-store",
	after: "ember-data",

	initialize() {}
};
