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
				.then(function( record ) {
					// get its data and unload it
					return record.toJSON();
				}, function() {
					var record = store.recordForId( "channelSettings", id );
					var data = record.toJSON();
					// unload generated empty record
					store.unloadRecord( record );
					return data;
				});
		}
	});

});
