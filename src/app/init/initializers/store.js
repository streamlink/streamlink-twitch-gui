import Store from "ember-data/store";


const { assign } = Object;


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
