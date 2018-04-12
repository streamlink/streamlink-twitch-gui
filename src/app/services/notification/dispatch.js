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
	i18n: service(),
	routing: service( "-routing" ),
	settings: service(),
	streaming: service(),


	dispatchNotifications: on(
		"streams-filtered",
		/**
		 * @param {TwitchStream[]} streams
		 * @returns {Promise}
		 */
		async function( streams ) {
			if ( !streams ) { return; }
			const length = get( streams, "length" );

			if ( length > 1 && get( this, "settings.notification.grouping" ) ) {
				// merge multiple notifications and show a single one
				const data = this._getNotificationDataGroup( streams );
				await this._showNotification( data );

			} else if ( length > 0 ) {
				await Promise.all( streams.map( async stream => {
					// download channel icon first and save it into a local temp dir...
					await iconDownload( stream );
					// show notification
					const data = this._getNotificationDataSingle( stream );
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
		const i18n = get( this, "i18n" );
		const settings = get( this, "settings.notification.click_group" );

		return new NotificationData({
			title: i18n.t( "services.notification.dispatch.group" ).toString(),
			message: streams.map( stream => ({
				title: get( stream, "channel.display_name" ),
				message: get( stream, "channel.status" ) || ""
			}) ),
			icon: iconGroup,
			click: () => this._notificationClick( streams, settings ),
			settings
		});
	},

	/**
	 * Show a notification for each stream
	 * @param {TwitchStream} stream
	 * @returns {NotificationData}
	 */
	_getNotificationDataSingle( stream ) {
		const i18n = get( this, "i18n" );
		const settings = get( this, "settings.notification.click" );
		const name = get( stream, "channel.display_name" );

		return new NotificationData({
			title: i18n.t( "services.notification.dispatch.single", { name } ).toString(),
			message: get( stream, "channel.status" ) || "",
			icon: get( stream, "logo" ) || iconGroup,
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

		logDebug( "Notification click", () => ({
			action,
			streams: streams.mapBy( "id" )
		}) );

		// restore the window
		if ( get( this, "settings.notification.click_restore" ) ) {
			setMinimized( false );
			setVisibility( true );
			setFocused( true );
		}

		if ( action === ATTR_NOTIFY_CLICK_FOLLOWED ) {
			get( this, "routing" ).transitionTo( "user.followedStreams" );

		} else if ( action === ATTR_NOTIFY_CLICK_STREAM ) {
			const streaming = get( this, "streaming" );
			await Promise.all( streams.map( async stream => {
				// don't await startStream promise and ignore errors
				streaming.startStream( stream )
					.catch( () => {} );
			}) );

		} else if ( action === ATTR_NOTIFY_CLICK_STREAMANDCHAT ) {
			const streaming = get( this, "streaming" );
			const openGlobal = get( this, "settings.streams.chat_open" );
			const chat = get( this, "chat" );

			await Promise.all( streams.map( async stream => {
				const channel = get( stream, "channel" );
				const { streams_chat_open: openChannel } = await channel.getChannelSettings();

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
				chat.openChat( channel )
					.catch( () => {} );
			}) );
		}
	},

	/**
	 * @param {NotificationData} data
	 * @returns {Promise}
	 */
	async _showNotification( data ) {
		const provider = get( this, "settings.notification.provider" );

		// don't await the notification promise here
		showNotification( provider, data, false )
			.catch( () => {} );
	}
});
