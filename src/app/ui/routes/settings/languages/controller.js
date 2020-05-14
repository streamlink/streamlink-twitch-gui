import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { langs as langsConfig } from "config";
import SettingsStreams from "data/models/settings/streams/fragment";


const { filterLanguages: contentStreamsFilterLanguages } = SettingsStreams;


export default Controller.extend({
	contentStreamsFilterLanguages,

	languages: computed(function() {
		return Object.keys( langsConfig )
			.filter( code => !langsConfig[ code ].disabled )
			.map( code => ({ id: code, label: code }) );
	})
});
