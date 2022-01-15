import { get } from "@ember/object";
import { default as Evented, on } from "@ember/object/evented";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import { iconGroup, iconDownload } from "./icons";
import { logDebug } from "./logger";
import NotificationData from "./data";
import { showNotification } from "./provider";
import {
	ATTR_NOTIFY_CLICK_NOOP,
	ATTR_NOTIFY_CLICK_FOLLOWED,
	ATTR_NOTIFY_CLICK_STREAM,
	ATTR_NOTIFY_CLICK_STREAMANDCHAT
} from "data/models/settings/notification/fragment";
import { setMinimized, setVisibility, setFocused } from "nwjs/Window";


export default Mixin.create( Evented, {
	chat: service(),
	/** @type {IntlService} */
	intl: service(),
	/** @type {RouterService} */
	router: service(),
	/** @type {SettingsService} */
	settings: service(),
	/** @type {StreamingService} */
	streaming: service(),


	dispatchNotifications: on(
		"streams-filtered",
		/**
		 * @param {TwitchStream[]} streams
		 * @returns {Promise}
		 */
		async function( streams ) {
			if ( !streams ) { return; }
			const { length } = streams;

			// load TwitchUser relationships first and work around the missing user_name attribute
			// https://github.com/twitchdev/issues/issues/500
			await Promise.all( streams.map( stream => stream.user.promise ) );

			if ( length > 1 && this.settings.content.notification.grouping ) {
				// merge multiple notifications and show a single one
				const data = this._getNotificationDataGroup( streams );
				await this._showNotification( data );

			} else if ( length > 0 ) {
				await Promise.all( streams.map( async stream => {
					// download channel icon first and save it into a local temp dir...
					const icon = await iconDownload( stream.user.content );
					// show notification
					const data = this._getNotificationDataSingle( stream, icon );
					await this._showNotification( data );
				}) );
			}
		}
	),

	/**
	 * Show multiple streams as one notification
	 * @param {TwitchStream[]} streams
	 * @returns {NotificationData}
	 */
	_getNotificationDataGroup( streams ) {
		const settings = this.settings.content.notification.click_group;

		return new NotificationData({
			title: this.intl.t( "services.notification.dispatch.group" ).toString(),
			message: streams.map( stream => ({
				title: get( stream, "user.display_name" ),
				message: stream.title || ""
			}) ),
			icon: iconGroup,
			click: () => this._notificationClick( streams, settings ),
			settings
		});
	},

	/**
	 * Show a notification for each stream
	 * @param {TwitchStream} stream
	 * @param {string} icon
	 * @returns {NotificationData}
	 */
	_getNotificationDataSingle( stream, icon ) {
		const settings = this.settings.content.notification.click;
		const name = get( stream, "user.display_name" );

		return new NotificationData({
			title: this.intl.t( "services.notification.dispatch.single", { name } ).toString(),
			message: stream.title || "",
			icon: icon || iconGroup,
			click: () => this._notificationClick( [ stream ], settings ),
			settings
		});
	},

	/**
	 * Notfication click callback
	 * @param {TwitchStream[]} streams
	 * @param {Number} action
	 * @returns {Promise}
	 */
	async _notificationClick( streams, action ) {
		if ( action === ATTR_NOTIFY_CLICK_NOOP ) {
			return;
		}

		await logDebug( "Notification click", () => ({
			action,
			streams: streams.mapBy( "id" )
		}) );

		// restore the window
		if ( this.settings.content.notification.click_restore ) {
			setMinimized( false );
			setVisibility( true );
			setFocused( true );
		}

		if ( action === ATTR_NOTIFY_CLICK_FOLLOWED ) {
			this.router.transitionTo( "user.followedStreams" );

		} else if ( action === ATTR_NOTIFY_CLICK_STREAM ) {
			const { streaming } = this;
			await Promise.all( streams.map( async stream => {
				// don't await startStream promise and ignore errors
				streaming.startStream( stream )
					.catch( () => {} );
			}) );

		} else if ( action === ATTR_NOTIFY_CLICK_STREAMANDCHAT ) {
			const { streaming, chat } = this;
			const openGlobal = this.settings.content.streams.chat_open;

			await Promise.all( streams.map( async stream => {
				const { streams_chat_open: openChannel } = await stream.getChannelSettings();

				// don't await startStream promise and ignore errors
				streaming.startStream( stream )
					.catch( () => {} );

				// TODO: refactor startStream and add another parameter to force opening the chat
				// chat was already opened by startStream() if
				// 1. openGlobal is false and openChannel is true
				// 2. openGlobal is true and openChannel is null
				// 3. openGlobal is true and openChannel is true
				// so open it only if
				// 4. openGlobal is false and openChannel is null
				// 5. openGlobal is false and openChannel is false
				// 6. openGlobal is true and openChannel is false
				if ( openGlobal && openChannel === null || openChannel === true ) {
					return;
				}
				// don't await openChat promise and ignore errors
				chat.openChat( get( stream, "user.login" ) )
					.catch( () => {} );
			}) );
		}
	},

	/**
	 * @param {NotificationData} data
	 * @returns {Promise}
	 */
	async _showNotification( data ) {
		const provider = this.settings.content.notification.provider;

		// don't await the notification promise here
		showNotification( provider, data, false )
			.catch( () => {} );
	}
});
