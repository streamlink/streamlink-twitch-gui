import { get, set, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import { Service } from "ember-intl";
import { locales as localesConfig } from "config";
import systemLocale from "utils/system-locale";


const { locales } = localesConfig;
const { hasOwnProperty } = {};


/**
 * @class IntlService
 * @extends {Service}
 */
const IntlService = {
	settings: service(),

	_settingsObserver: observer( "settings.content.gui.language", function() {
		let locale = get( this, "settings.content.gui.language" );
		if ( locale === "auto" || !locales || !hasOwnProperty.call( locales, locale ) ) {
			locale = systemLocale /* istanbul ignore next */ || "en";
		}

		set( this, "locale", [ locale ] );
	}),

	init() {
		this._super( ...arguments );

		// the observer doesn't trigger without reading the settings property first
		get( this, "settings" );
	}
};


export default Service.extend( IntlService );
