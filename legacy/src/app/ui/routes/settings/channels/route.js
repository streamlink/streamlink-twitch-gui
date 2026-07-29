import { default as EmberObject, set, computed } from "@ember/object";
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
		const { /** @type {DS.Store} */ store } = this;
		const channelSettings = await store.findAll( "channel-settings" );

		// we need all channelSettings records, so we can search for specific ones
		// that have not been added to the controller's model yet
		this.all = channelSettings.map( record =>
			// return both channelSettings and twitchChannel records
			EmberObject.extend({
				settings: record,
				// Load the TwitchUser (and TwitchChannel) records on demand (PromiseObject).
				// Will be triggered by the first property read-access.
				// Load TwitchChannel simultaneously, so it's ready immediately when accessing
				// the user.channel relationship.
				user: computed(function() {
					const { id } = record;
					const loader = async () => {
						const [ user ] = await Promise.all([
							store.findRecord( "twitch-user", id ),
							store.findRecord( "twitch-channel", id )
						]);
						await preload( user, "profile_image_url" );

						return user;
					};
					const promise = loader();

					return PromiseObject.create({ promise });
				})
			}).create()
		);

		return await this.fetchContent();
	},

	async fetchContent() {
		const { limit, offset } = this;

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
