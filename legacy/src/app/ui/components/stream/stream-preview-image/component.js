import Component from "@ember/component";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import {
	ATTR_STREAMS_CLICK_NOOP,
	ATTR_STREAMS_CLICK_LAUNCH,
	ATTR_STREAMS_CLICK_CHAT,
	ATTR_STREAMS_CLICK_CHANNEL,
	ATTR_STREAMS_CLICK_SETTINGS
} from "data/models/settings/streams/fragment";
import { qualities } from "data/models/stream/model";
import t from "translation-key";
import { twitch as twitchConfig } from "config";
import layout from "./template.hbs";


const { "channel-url": channelUrl } = twitchConfig;


export default Component.extend({
	/** @type {ChatService} */
	chat: service(),
	/** @type {NwjsService} */
	nwjs: service(),
	/** @type {RouterService} */
	router: service(),
	/** @type {SettingsService} */
	settings: service(),
	/** @type {StreamingService} */
	streaming: service(),

	layout,

	tagName: "div",
	classNameBindings: [
		":preview",
		"class",
		"opened:opened"
	],
	attributeBindings: [
		"title",
		"noMiddleclickScroll:data-no-middleclick-scroll"
	],
	"class": "",

	/** @type {TwitchStream} */
	stream: null,
	/** @type {TwitchUser} */
	user: null,

	/** @type {(true|null)} */
	noMiddleclickScroll: computed( "settings.content.streams.click_middle", function() {
		return this.settings.content.streams.click_middle !== ATTR_STREAMS_CLICK_NOOP || null;
	}),

	clickable: true,


	opened: computed( "stream.id", "streaming.model.@each.id", function() {
		return this.stream && this.streaming.model.mapBy( "id" ).indexOf( this.stream.id ) !== -1;
	}),


	mouseUp( event ) {
		if ( event.button === 1 ) {
			this.click( event );
		}
	},

	click( event ) {
		if ( this.clickable ) {
			const action = event.button === 0
				// left mouse button
				? ( event.ctrlKey || event.metaKey
					// with modifier key
					? this.settings.content.streams.click_modify
					// without modifier keys (default action)
					: ATTR_STREAMS_CLICK_LAUNCH
				)
				: ( event.button === 1
					// middle mouse button
					? this.settings.content.streams.click_middle
					// everything else (no action)
					: ATTR_STREAMS_CLICK_NOOP
				);

			switch ( action ) {
				case ATTR_STREAMS_CLICK_LAUNCH:
					return this.startStream();
				case ATTR_STREAMS_CLICK_CHAT:
					return this.openChat();
				case ATTR_STREAMS_CLICK_CHANNEL:
					return this.gotoChannelPage();
				case ATTR_STREAMS_CLICK_SETTINGS:
					return this.gotoChannelSettings();
			}
		}

		if ( this.attrs.action instanceof Function ) {
			this.attrs.action();
		}
	},

	contextMenu( event ) {
		if ( this.attrs.noContextmenu ) { return; }

		const items = [];

		if ( this.stream ) {
			const quals = qualities.map( quality => ({
				label: [ t`qualities.${quality.id}` ],
				click: () => this.startStream( quality.id )
			}) );
			if ( this.opened ) {
				items.push(
					{
						label: [ t`contextmenu.close-stream` ],
						click: () => this.closeStream()
					},
					{
						label: [ t`contextmenu.change-quality` ],
						submenu: quals
					}
				);
			} else {
				items.push(
					{
						label: [ t`contextmenu.launch-stream` ],
						submenu: quals
					}
				);
			}
		}

		items.push(
			{
				label: [ t`contextmenu.open-chat` ],
				click: () => this.openChat()
			},
			{
				label: [ t`contextmenu.copy-channel-url` ],
				click: () => this.copyChannelURL()
			}
		);

		if ( !this.attrs.contextmenuNoGotos ) {
			items.push(
				{
					label: [ t`contextmenu.channel-page` ],
					click: () => this.gotoChannelPage()
				},
				{
					label: [ t`contextmenu.channel-settings` ],
					click: () => this.gotoChannelSettings()
				}
			);
		}

		this.nwjs.contextMenu( event, items );
	},


	startStream( quality ) {
		this.streaming.startStream( this.stream, quality );
	},

	closeStream() {
		this.streaming.closeStream( this.stream );
	},

	openChat() {
		const login = get( this, "stream.user_login" ) || get( this, "user.login" );
		this.chat.openChat( login );
	},

	copyChannelURL() {
		const login = get( this, "stream.user_login" ) || get( this, "user.login" );
		this.nwjs.clipboard.set( channelUrl.replace( "{channel}", login ) );
	},

	gotoChannelPage() {
		const id = get( this, "stream.id" ) || get( this, "user.id" );
		this.router.transitionTo( "channel", id );
	},

	gotoChannelSettings() {
		const id = get( this, "stream.id" ) || get( this, "user.id" );
		this.router.transitionTo( "channel.settings", id );
	}
});
