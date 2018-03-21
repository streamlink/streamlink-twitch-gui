import { get, set, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import { Service } from "ember-i18n/addon";


export default Service.extend({
	settings: service(),

	_settingsObserver: observer( "settings.content.gui.language", function() {
		const language = get( this, "settings.content.gui.language" );

		set( this, "locale", language );
	}),

	init() {
		this._super( ...arguments );

		// the observer doesn't trigger without reading the settings property first
		get( this, "settings" );
	}
});
