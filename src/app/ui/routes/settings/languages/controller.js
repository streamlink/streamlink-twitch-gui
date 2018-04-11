import Controller from "@ember/controller";
import { get, set, computed } from "@ember/object";
import { langs as langsConfig } from "config";
import SettingsStreams from "data/models/settings/streams/fragment";


const { filterLanguages: contentStreamsFilterLanguages } = SettingsStreams;


export default Controller.extend({
	contentStreamsFilterLanguages,

	languages: computed(function() {
		return Object.keys( langsConfig )
			.filter( code => !langsConfig[ code ].disabled );
	}),


	actions: {
		checkLanguages( all ) {
			const filters = get( this, "model.streams.languages" );
			const languages = get( this, "languages" );
			for ( const id of languages ) {
				set( filters, id, all );
			}
		}
	}
});
