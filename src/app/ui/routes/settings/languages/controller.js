import Controller from "@ember/controller";
import { get, setProperties, computed } from "@ember/object";
import { langs as langsConfig } from "config";
import { default as SettingsStreams } from "data/models/settings/streams/fragment";


const {
	languagesFilter: contentLanguagesFilter
} = SettingsStreams;


export default Controller.extend({
	contentLanguagesFilter,

	hasAnySelection: false,

	languages: computed(function() {
		return Object.entries( langsConfig )
			.filter( ([ , { disabled } ]) => !disabled )
			.map( ([ code ]) => code );
	}),

	actions: {
		uncheckAll() {
			const buffer = get( this, "model.streams.languages" );
			const allFalse = Object.keys( buffer.getContent() ).reduce( ( obj, key ) => {
				obj[ key ] = false;
				return obj;
			}, {} );
			setProperties( buffer, allFalse );
		}
	}
});
