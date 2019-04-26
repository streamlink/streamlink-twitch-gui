import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { locales as localesConfig, themes as themesConfig } from "config";
import systemLocale from "services/i18n/system-locale";


const { locales } = localesConfig;
const { themes } = themesConfig;


export default class SettingsMainController extends Controller {
	systemThemeId = "system";

	@computed()
	get contentGuiLanguages() {
		const compare = new Intl.Collator( "en", { sensitivity: "base" } ).compare;
		const languages = Object.keys( locales )
			.map( key => ({
				id: key,
				label: locales[ key ]
			}) )
			// sort by localized language name in English order
			.sort( ( a, b ) => compare( a.label, b.label ) );

		// add auto selection to the top
		languages.unshift({ id: "auto", label: locales[ systemLocale ] });

		return languages;
	}

	@computed()
	get contentGuiTheme() {
		return [ this.systemThemeId, ...themes ].map( id => ({ id }) );
	}
}
