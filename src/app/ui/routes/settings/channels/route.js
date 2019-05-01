import { set, computed } from "@ember/object";
import { PromiseObject } from "ember-data/-private";
import SettingsSubmenuRoute from "../-submenu/route";
import InfiniteScrollMixin from "ui/routes/-mixins/routes/infinite-scroll";
import preload from "utils/preload";


class SettingsChannelsItem {
	constructor( store, channelSettings ) {
		this.store = store;
		this.settings = channelSettings;
	}

	/** @type {DS.Store} */
	store;

	/** @type {ChannelSettings} */
	settings;

	/**
	 * @returns {Promise<TwitchChannel>}
	 */
	async _getChannel() {
		/** @type {TwitchUser} */
		const user = await this.store.queryRecord( "twitch-user", this.settings.id );
		const channel = await user.loadChannel();
		await preload( channel, "logo" );

		return channel;
	}

	/** @type {DS.PromiseObject<TwitchChannel>} channel */
	@computed()
	get channel() {
		const promise = this._getChannel();

		return PromiseObject.create({ promise });
	}
}


export default class SettingsChannelsRoute
extends SettingsSubmenuRoute.extend( InfiniteScrollMixin ) {
	controllerName = "settingsChannels";
	itemSelector = ".settings-channel-item-component";

	/** @type {SettingsChannelsItem[]} */
	all = null;

	async model() {
		const store = this.store;
		/** @type {ChannelSettings[]} */
		const channelSettings = await store.findAll( "channel-settings" );
		this.all = channelSettings.map( record => new SettingsChannelsItem( store, record ) );

		return await this.fetchContent();
	}

	async fetchContent() {
		const limit = this.limit;
		const offset = this.offset;

		return this.all.slice( offset, offset + limit );
	}

	setupController( controller ) {
		set( controller, "all", this.all );

		return super.setupController( ...arguments );
	}

	deactivate() {
		super.deactivate( ...arguments );
		this.all = null;
	}
}
