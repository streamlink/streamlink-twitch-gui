/** @typedef {{id: string, query: string, filter: string, date: string}} SearchSerialized */

/** @param {Object<string, SearchSerialized>} records */
function removeStreamsFilter( records ) {
	const channelsQueries = new Set();

	for ( const record of Object.values( records ) ) {
		const { filter } = record;
		if ( filter === "channels" ) {
			channelsQueries.add( record.query );
		} else if ( filter === "streams" ) {
			if ( !channelsQueries.has( record.query ) ) {
				record.filter = "channels";
			} else {
				delete records[ record.id ];
			}
		}
	}
}


/** @param {Object<string, SearchSerialized>} records */
export default function updateSearch( records ) {
	removeStreamsFilter( records );
}
