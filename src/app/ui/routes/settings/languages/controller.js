import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { langs as langsConfig } from "config";
import SettingsStreams from "data/models/settings/streams/fragment";


const { filterLanguages: contentStreamsFilterLanguages } = SettingsStreams;


export default class SettingsLanguagesController extends Controller {
	contentStreamsFilterLanguages = contentStreamsFilterLanguages;

	@computed()
	get languages() {
		return Object.keys( langsConfig )
			.filter( code => !langsConfig[ code ].disabled )
			.map( code => ({ id: code, label: code }) );
	}
}
