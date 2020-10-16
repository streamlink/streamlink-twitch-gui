import Controller from "@ember/controller";
import { get, setProperties, computed } from "@ember/object";
import { langs as langsConfig } from "config";


export default Controller.extend({
	hasAnySelection: false,
	hasSingleSelection: false,

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
