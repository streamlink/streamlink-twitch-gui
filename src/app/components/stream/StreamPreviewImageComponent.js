import Component from "@ember/component";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Menu from "nwjs/Menu";
import { set as setClipboard } from "nwjs/Clipboard";
import {
	ATTR_STREAMS_CLICK_NOOP,
	ATTR_STREAMS_CLICK_LAUNCH,
	ATTR_STREAMS_CLICK_CHAT,
	ATTR_STREAMS_CLICK_CHANNEL,
	ATTR_STREAMS_CLICK_SETTINGS
} from "models/localstorage/Settings/streams";
import qualities from "models/stream/qualities";
import layout from "templates/components/stream/StreamPreviewImageComponent.hbs";


export default Component.extend({
	chat: service(),
	i18n: service(),
	routing: service( "-routing" ),
	settings: service(),
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

	noMiddleclickScroll: computed( "settings.streams.click_middle", function() {
		// true or null
		return get( this, "settings.streams.click_middle" ) !== ATTR_STREAMS_CLICK_NOOP || null;
	}),

	clickable: true,


	opened: computed( "channel.id", "streaming.model.length", function() {
		const model = get( this, "streaming.model" );
		const id    = get( this, "channel.id" );

		return model.mapBy( "channel.id" ).indexOf( id ) !== -1;
	}),


	mouseUp( event ) {
		if ( event.button === 1 ) {
			this.click( event );
		}
	},

	click( event ) {
		if ( get( this, "clickable" ) ) {
			const action = event.button === 0
				// left mouse button
				? ( event.ctrlKey || event.metaKey
					// with modifier key
					? get( this, "settings.streams.click_modify" )
					// without modifier keys (default action)
					: ATTR_STREAMS_CLICK_LAUNCH
				)
				: ( event.button === 1
					// middle mouse button
					? get( this, "settings.streams.click_middle" )
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

		const i18n = get( this, "i18n" );
		const menu = Menu.create();

		const quals = qualities.map( quality => ({
			label: quality.label,
			click: () => this.startStream( quality.id )
		}) );

		if ( get( this, "stream" ) ) {
			if ( get( this, "opened" ) ) {
				menu.items.pushObjects([
					{
						label: i18n.t( "contextmenu.close-stream" ).toString(),
						click: () => this.closeStream()
					},
					{
						label: i18n.t( "contextmenu.change-quality" ).toString(),
						submenu: quals
					}
				]);
			} else {
				menu.items.pushObjects([
					{
						label: i18n.t( "contextmenu.launch-stream" ).toString(),
						submenu: quals
					}
				]);
			}
		}

		menu.items.pushObjects([
			{
				label: i18n.t( "contextmenu.open-chat" ).toString(),
				click: () => this.openChat()
			},
			{
				label: i18n.t( "contextmenu.copy-channel-url" ).toString(),
				click: () => this.copyChannelURL()
			}
		]);

		if ( !this.attrs.contextmenuNoGotos ) {
			menu.items.pushObjects([
				{
					label: i18n.t( "contextmenu.channel-page" ).toString(),
					click: () => this.gotoChannelPage()
				},
				{
					label: i18n.t( "contextmenu.channel-settings" ).toString(),
					click: () => this.gotoChannelSettings()
				}
			]);
		}

		menu.popup( event );
	},


	startStream( quality ) {
		const streaming = get( this, "streaming" );
		const stream = get( this, "stream" );
		streaming.startStream( stream, quality );
	},

	closeStream() {
		const streaming = get( this, "streaming" );
		const stream = get( this, "stream" );
		streaming.closeStream( stream );
	},

	openChat() {
		const chat = get( this, "chat" );
		const channel = get( this, "channel" );
		chat.openChat( channel );
	},

	copyChannelURL() {
		const url = get( this, "channel.url" );
		setClipboard( url );
	},

	gotoChannelPage() {
		const routing = get( this, "routing" );
		const id = get( this, "channel.id" );
		routing.transitionTo( "channel", id );
	},

	gotoChannelSettings() {
		const routing = get( this, "routing" );
		const id = get( this, "channel.id" );
		routing.transitionTo( "channel.settings", id );
	}
});
