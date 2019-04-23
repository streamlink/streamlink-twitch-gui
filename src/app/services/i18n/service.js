import { set } from "@ember/object";
import { inject as service } from "@ember/service";
import { observes, on } from "@ember-decorators/object";
import { Service as OriginalI18nService } from "ember-i18n/addon";
import { locales as localesConfig } from "config";
import systemLocale from "./system-locale";


const { locales } = localesConfig;
const { hasOwnProperty } = {};


export default class I18nService extends OriginalI18nService {
	/** @type {SettingsService} */
	@service settings;


	@on( "init" )
	_initSettings() {
		return this.settings;
	}

	@observes( "settings.content.gui.language" )
	_languageObserver() {
		let locale = this.settings.content.gui.language;
		if ( locale === "auto" || !locales || !hasOwnProperty.call( locales, locale ) ) {
			locale = systemLocale /* istanbul ignore next */ || "en";
		}

		set( this, "locale", locale );
	}

	/**
	 * @param {string} key
	 * @param {Object?} data
	 * @returns {Handlebars.SafeString}
	 */
	t( key, data = {} ) {
		return super.t( key, data );
	}
}
