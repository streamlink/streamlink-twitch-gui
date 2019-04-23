import { set } from "@ember/object";
import Evented from "@ember/object/evented";
import ObjectProxy from "@ember/object/proxy";
import { inject as service } from "@ember/service";
import { on } from "@ember-decorators/object";


// A service object is just a regular object, so we can use an ObjectProxy as well
export default class SettingsService extends ObjectProxy.extend( Evented ) {
	static isServiceFactory = true;

	/** @type {DS.Store} */
	@service store;

	/** @type {Settings} */
	content = null;

	@on( "init" )
	async _initContent() {
		/** @type {Settings} */
		const settings = await this.store.findOrCreateRecord( "settings" );
		set( this, "content", settings );

		settings.on( "didUpdate", ( ...args ) => this.trigger( "didUpdate", ...args ) );
		this.trigger( "initialized" );
	}
}
