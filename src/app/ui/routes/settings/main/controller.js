import Controller from "@ember/controller";
import { get, set, computed } from "@ember/object";
import { locales as localesConfig, themes as themesConfig } from "config";
import systemLocale from "utils/system-locale";


const { locales } = localesConfig;
const { themes } = themesConfig;

const { hasOwnProperty } = {};


export default Controller.extend({
	systemThemeId: "system",

	// fix empty language selection when switching between builds while adding new translations
	guiLanguage: computed({
		get() {
			const lang = get( this, "model.gui.language" );

			return hasOwnProperty.call( locales, lang )
				? lang
				: "auto";
		},
		set( _, value ) {
			return set( this, "model.gui.language", value );
		}
	}),

	contentGuiLanguage: computed(function() {
		const languages = Object.keys( locales )
			.sort()
			.map( key => ({
				id: key,
				label: locales[ key ]
			}) );

		// add auto selection to the top
		languages.unshift({ id: "auto", label: locales[ systemLocale ] });

		return languages;
	}),

	contentGuiTheme: computed(function() {
		return [ this.systemThemeId, ...themes ].map( id => ({ id }) );
	})
});
