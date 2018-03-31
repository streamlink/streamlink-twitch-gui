import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { locales as localesConfig, themes as themesConfig } from "config";


const { locales } = localesConfig;
const { themes } = themesConfig;


export default Controller.extend({
	contentGuiLanguages: computed(function() {
		const compare = new Intl.Collator( "en", { sensitivity: "base" } ).compare;

		return Object.keys( locales )
			.map( key => ({
				id: key,
				label: locales[ key ]
			}) )
			// sort by localized language name in English order
			.sort( ( a, b ) => compare( a.label, b.label ) );
	}),

	contentGuiTheme: computed(function() {
		return themes.map( id => ({ id }) );
	})
});
