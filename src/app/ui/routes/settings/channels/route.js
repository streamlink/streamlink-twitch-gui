import { default as EmberObject, get, set, computed } from "@ember/object";
import PromiseProxyMixin from "@ember/object/promise-proxy-mixin";
import ObjectProxy from "@ember/object/proxy";
import SettingsSubmenuRoute from "../-submenu/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import preload from "utils/preload";


// build our own PromiseObject in order to avoid importing from a private ember-data module
// TODO: import from @ember-data/promise-proxies once it becomes available
const PromiseObject = ObjectProxy.extend( PromiseProxyMixin );


export default SettingsSubmenuRoute.extend( InfiniteScrollMixin, {
	controllerName: "settingsChannels",
	itemSelector: ".settings-channel-item-component",

	all: null,


	async model() {
		const store = get( this, "store" );
		const channelSettings = await store.findAll( "channelSettings" );

		// we need all channelSettings records, so we can search for specific ones
		// that have not been added to the controller's model yet
		this.all = channelSettings.map( record =>
			// return both channelSettings and twitchChannel records
			EmberObject.extend({
				settings: record,
				// load the twitchChannel record on demand (PromiseObject)
				// will be triggered by the first property read-access
				channel: computed(function() {
					const id = get( record, "id" );
					const promise = store.findRecord( "twitchUser", id )
						.then( user => get( user, "channel" ) )
						.then( record => preload( record, "logo" ) );

					return PromiseObject.create({ promise });
				})
			}).create()
		);

		return await this.fetchContent();
	},

	async fetchContent() {
		const limit = get( this, "limit" );
		const offset = get( this, "offset" );

		return this.all.slice( offset, offset + limit );
	},

	setupController( controller ) {
		set( controller, "all", this.all );
		this._super( ...arguments );
	},

	deactivate() {
		this._super( ...arguments );
		this.all = null;
	}
});
