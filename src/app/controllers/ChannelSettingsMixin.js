define( [ "ember" ], function( Ember ) {

	return Ember.Mixin.create({
		/**
		 * Load channel specific settings
		 * @param {number} id
		 * @returns {Promise}
		 */
		loadChannelSettings: function( id ) {
			var store = this.store;
			return store.find( "channelSettings", id )
				.catch(function() {
					// return the generated empty record from the store
					return store.recordForId( "channelSettings", id );
				})
				.then(function( record ) {
					// get its data and unload it
					var data = record.toJSON();
					store.unloadRecord( record );
					return data;
				});
		}
	});

});
