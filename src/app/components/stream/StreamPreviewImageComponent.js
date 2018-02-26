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


	opened: computed( "stream.channel.id", "streaming.model.length", function() {
		let model = get( this, "streaming.model" );
		let id    = get( this, "stream.channel.id" );

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

		const menu = Menu.create();

		const quals = qualities.map( quality => ({
			label: quality.label,
			click: () => this.startStream( quality.id )
		}) );

		if ( get( this, "stream" ) ) {
			if ( get( this, "opened" ) ) {
				menu.items.pushObjects([
					{
						label: "Close stream",
						click: () => this.closeStream()
					},
					{
						label: "Change quality",
						submenu: quals
					}
				]);
			} else {
				menu.items.pushObjects([
					{
						label: "Launch stream",
						submenu: quals
					}
				]);
			}
		}

		menu.items.pushObjects([
			{
				label: "Open chat",
				click: () => this.openChat()
			},
			{
				label: "Copy channel URL",
				click: () => this.copyChannelURL()
			}
		]);

		if ( !this.attrs.contextmenuNoGotos ) {
			menu.items.pushObjects([
				{
					label: "Channel page",
					click: () => this.gotoChannelPage()
				},
				{
					label: "Channel settings",
					click: () => this.gotoChannelSettings()
				}
			]);
		}

		menu.popup( event );
	},


	startStream( quality ) {
		let stream = get( this, "stream" );
		get( this, "streaming" ).startStream( stream, quality );
	},

	closeStream() {
		let stream = get( this, "stream" );
		get( this, "streaming" ).closeStream( stream );
	},

	openChat() {
		const chat = get( this, "chat" );
		const channel = get( this, "stream.channel" );
		chat.openChat( channel );
	},

	copyChannelURL() {
		let url = get( this, "stream.channel.url" );
		setClipboard( url );
	},

	gotoChannelPage() {
		let name = get( this, "stream.channel.id" );
		get( this, "routing" ).transitionTo( "channel", name );
	},

	gotoChannelSettings() {
		let name = get( this, "stream.channel.id" );
		get( this, "routing" ).transitionTo( "channel.settings", name );
	}
});
