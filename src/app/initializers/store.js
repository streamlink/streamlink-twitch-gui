import Ember from "Ember";
import DS from "EmberData";


var merge = Ember.merge;


// no initializer here: just upgrade the application store
DS.Store.reopen({
	/**
	 * Find a record and unload the generated record
	 * @param {string} modelName
	 * @param {string|number} id
	 * @param {Object?} options
	 * @param {boolean?} options.reload
	 * @returns {Promise.<DS.Model?>}
	 */
	findExistingRecord: function( modelName, id, options ) {
		var store = this;
		options = merge( { reload: true }, options );

		return store.findRecord( modelName, id, options )
			.catch(function() {
				// unload the generated empty record
				var record = store.peekRecord( modelName, id );
				if ( record ) {
					store.unloadRecord( record );
				}
				return Promise.reject();
			});
	},

	query: function() {
		return this._super.apply( this, arguments )
			.then(function( recordArray ) {
				recordArray._unregisterFromManager();
				return recordArray;
			});
	}
});
