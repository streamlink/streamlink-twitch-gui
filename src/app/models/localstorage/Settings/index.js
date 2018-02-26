import { get, set } from "@ember/object";
import { on } from "@ember/object/evented";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { fragment } from "ember-data-model-fragments/attributes";


/**
 * @class Settings
 */
export default Model.extend({
	advanced: attr( "boolean", { defaultValue: false } ),
	gui: fragment( "settingsGui", { defaultValue: {} } ),
	streaming: fragment( "settingsStreaming", { defaultValue: {} } ),
	streams: fragment( "settingsStreams", { defaultValue: {} } ),
	chat: fragment( "settingsChat", { defaultValue: {} } ),
	notification: fragment( "settingsNotification", { defaultValue: {} } ),


	init() {
		this._super( ...arguments );

		/*
		 * Define hasStreamsLanguagesSelection on the Settings model instead of the
		 * SettingsStreamsLanguages fragment, because we need to listen to the ready and didUpdate
		 * events of the Settings model.
		 * Use an object property descriptor to set enumerable to false, so that it is not included
		 * in the SettingsController's model object buffer.
		 */
		Object.defineProperty( this, "hasStreamsLanguagesSelection", {
			enumerable: false,
			writable: true,
			value: false
		});
	},

	_hasStreamsLanguagesSelection: on( "ready", "didUpdate", function() {
		let ret = false;

		const fragment = get( this, "streams.languages" );
		if ( fragment ) {
			const languages = fragment.toJSON();
			const keys = Object.entries( languages );
			if ( keys.length ) {
				let [ , previous ] = keys.shift();
				for ( const [ , key ] of keys ) {
					if ( previous !== key ) {
						ret = true;
						break;
					}
					previous = key;
				}
			}
		}

		return set( this, "hasStreamsLanguagesSelection", ret );
	})

}).reopenClass({
	toString() { return "Settings"; }
});
