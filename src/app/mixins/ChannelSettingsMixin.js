import {
	get,
	inject,
	Mixin
} from "ember";


const { service } = inject;


export default Mixin.create({
	store: service(),

	/**
	 * Load channel specific settings
	 * @param {number} id
	 * @returns {Promise}
	 */
	loadChannelSettings( id ) {
		const store = get( this, "store" );
		return store.findRecord( "channelSettings", id )
			.then(function( record ) {
				// get its data and unload it
				return record.toJSON();
			}, function() {
				const record = store.recordForId( "channelSettings", id );
				const data = record.toJSON();
				// unload generated empty record
				store.unloadRecord( record );
				return data;
			});
	}
});
