import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { locales as localesConfig, themes as themesConfig } from "config";


const { locales } = localesConfig;
const { themes } = themesConfig;


export default Controller.extend({
	contentGuiLanguages: computed(function() {
		return Object.keys( locales )
			.map( key => ({
				id: key,
				label: locales[ key ]
			}) );
	}),

	contentGuiTheme: computed(function() {
		return themes.map( id => ({ id }) );
	})
});
