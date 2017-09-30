import {
	get,
	inject,
	on,
	Evented,
	Mixin
} from "ember";
import {
	iconGroup,
	iconDownload
} from "./icons";
import { logDebug } from "./logger";
import { showNotification } from "./provider";
import {
	ATTR_NOTIFY_CLICK_NOOP,
	ATTR_NOTIFY_CLICK_FOLLOWED,
	ATTR_NOTIFY_CLICK_STREAM,
	ATTR_NOTIFY_CLICK_STREAMANDCHAT
} from "models/localstorage/Settings";
import {
	setMinimized,
	setVisibility,
	setFocused
} from "nwjs/Window";


const { service } = inject;


export default Mixin.create( Evented, {
	chat: service(),
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

			if ( length > 1 && get( this, "settings.notify_grouping" ) ) {
				// merge multiple notifications and show a single one
				await this._showNotificationGroup( streams );

			} else if ( length > 0 ) {
				// download all channel icons first and save them into a local temp dir...
				await Promise.all( streams.map( async stream =>
					iconDownload( stream )
				) );
				// show all notifications
				await Promise.all( streams.map( async stream =>
					this._showNotificationSingle( stream )
				) );
			}
		}
	),

	/**
	 * Show multiple streams as one notification
	 * @param {TwitchStream[]} streams
	 * @returns {Promise}
	 */
	async _showNotificationGroup( streams ) {
		const settings = get( this, "settings.notify_click_group" );

		return this._showNotification({
			title  : "Some followed channels have started streaming",
			message: streams.map( stream => ({
				title  : get( stream, "channel.display_name" ),
				message: get( stream, "channel.status" ) || ""
			}) ),
			icon   : iconGroup,
			click  : () => this._notificationClick( settings, streams ),
			settings
		});
	},

	/**
	 * Show a notification for each stream
	 * @param {TwitchStream} stream
	 * @returns {Promise}
	 */
	async _showNotificationSingle( stream ) {
		const settings = get( this, "settings.notify_click" );
		const name = get( stream, "channel.display_name" );

		return this._showNotification({
			title  : `${name} has started streaming`,
			message: get( stream, "channel.status" ) || "",
			icon   : get( stream, "logo" ) || iconGroup,
			click  : () => this._notificationClick( settings, [ stream ] ),
			settings
		});
	},

	/**
	 * Notfication click callback
	 * @param {Number} action
	 * @param {TwitchStream[]} streams
	 */
	_notificationClick( action, streams ) {
		if ( action === ATTR_NOTIFY_CLICK_NOOP ) {
			return;
		}

		logDebug( "Notification click", () => ({
			action,
			streams: streams.mapBy( "id" )
		}) );

		// restore the window
		if ( get( this, "settings.notify_click_restore" ) ) {
			setMinimized( false );
			setVisibility( true );
			setFocused( true );
		}

		if ( action === ATTR_NOTIFY_CLICK_FOLLOWED ) {
			get( this, "routing" ).transitionTo( "user.followedStreams" );

		} else if ( action === ATTR_NOTIFY_CLICK_STREAM ) {
			const streaming = get( this, "streaming" );
			streams.forEach( stream => streaming.startStream( stream ).catch( () => {} ) );

		} else if ( action === ATTR_NOTIFY_CLICK_STREAMANDCHAT ) {
			const streaming = get( this, "streaming" );
			const openchat = get( this, "settings.gui_openchat" );
			const chat = get( this, "chat" );
			streams.forEach( stream => {
				streaming.startStream( stream ).catch( () => {} );
				// don't open the chat twice (startStream may open chat already)
				if ( !openchat ) {
					const channel = get( stream, "channel" );
					chat.open( channel ).catch( () => {} );
				}
			});
		}
	},

	/**
	 * @param {Object} notification
	 * @returns {Promise}
	 */
	async _showNotification( notification ) {
		const provider = get( this, "settings.notify_provider" );

		// don't await the notification promise here
		showNotification( provider, notification, provider !== "auto" )
			.catch( () => {} );
	}
});
