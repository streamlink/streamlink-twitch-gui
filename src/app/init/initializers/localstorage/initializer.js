import LS from "./localstorage";
import updateNamespaces from "./namespaces";
import updateSettings from "./settings";
import updateChannelSettings from "./channelsettings";


export default {
	name: "localstorage",
	before: "ember-data",

	initialize() {
		try {
			updateNamespaces( LS );
		} catch ( e ) {}

		try {
			const data = JSON.parse( LS.getItem( "settings" ) );
			if ( !data || !data.settings || !data.settings.records[1] ) { throw null; }
			updateSettings( data.settings.records[1] );
			LS.setItem( "settings", JSON.stringify( data ) );
		} catch ( e ) {}

		try {
			const data = JSON.parse( LS.getItem( "channelsettings" ) );
			// data key has a dash in it
			if ( !data || !data[ "channel-settings" ] ) { throw null; }
			const { records } = data[ "channel-settings" ];
			for ( const [ , record ] of Object.entries( records ) ) {
				updateChannelSettings( record );
			}
			LS.setItem( "channelsettings", JSON.stringify( data ) );
		} catch ( e ) {}
	}
};
