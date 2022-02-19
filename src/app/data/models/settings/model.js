import { set } from "@ember/object";
import { addListener } from "@ember/object/events";
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
	hotkeys: fragment( "settingsHotkeys", { defaultValue: {} } ),


	init() {
		this._super( ...arguments );

		/*
		 * Define this on the Settings model instead of the SettingsStreamsLanguages fragment,
		 * because we need to listen to the ready and didUpdate events of the Settings model.
		 * Use an object property descriptor to set enumerable to false, so that it is not included
		 * in the SettingsController's model object buffer.
		 */
		Object.defineProperty( this, "hasAnyStreamsLanguagesSelection", {
			enumerable: false,
			writable: true,
			value: false
		});

		const update = () => {
			const data = this.streams.languages.toJSON();
			const num = Object.values( data ).filter( Boolean ).length;
			set( this, "hasAnyStreamsLanguagesSelection", num > 0 );
		};

		addListener( this, "ready", update );
		addListener( this, "didUpdate", update );
	}

}).reopenClass({
	toString() { return "Settings"; }
});
