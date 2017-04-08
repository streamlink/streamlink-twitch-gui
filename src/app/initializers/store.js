import { assign } from "Ember";
import { Store } from "EmberData";


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

	query() {
		return this._super( ...arguments )
			.then( recordArray => {
				recordArray._unregisterFromManager();
				return recordArray;
			});
	}
});
