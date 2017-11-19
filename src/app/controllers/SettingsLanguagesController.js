import {
	get,
	set,
	computed,
	Controller
} from "ember";
import {
	langs as langsConfig
} from "config";
import SettingsStreams from "models/localstorage/Settings/streams";


export default Controller.extend({
	SettingsStreams,

	languages: computed(function() {
		return Object.keys( langsConfig )
			.filter( code => !langsConfig[ code ].disabled )
			.map( id => ({
				id,
				lang: langsConfig[ id ][ "lang" ]
			}) );
	}),


	actions: {
		checkLanguages( all ) {
			const filters = get( this, "model.streams.languages" );
			const languages = get( this, "languages" );
			for ( const { id } of languages ) {
				set( filters, id, all );
			}
		}
	}
});
