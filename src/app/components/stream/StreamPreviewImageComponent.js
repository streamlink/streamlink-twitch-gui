import {
	get,
	computed,
	inject,
	Component
} from "Ember";
import Menu from "nwjs/Menu";
import { set as setClipboard } from "nwjs/Clipboard";
import Settings from "models/localstorage/Settings";
import qualities from "models/stream/qualities";
import layout from "templates/components/stream/StreamPreviewImageComponent.hbs";


const { service } = inject;

const actions = Settings.stream_click.reduce(function( obj, item ) {
	obj[ item.key ] = item.id;
	return obj;
}, {} );


export default Component.extend({
	chat: service(),
	routing: service( "-routing" ),
	settings: service(),
	streaming: service(),

	layout,

	tagName: "div",
	classNameBindings: [ ":preview", "class", "opened:opened" ],
	attributeBindings: [ "title", "noMiddleclickScroll:data-no-middleclick-scroll" ],
	"class": "",
	noMiddleclickScroll: computed( "settings.stream_click_middle", function() {
		// true or null
		return get( this, "settings.stream_click_middle" ) !== actions.disabled || null;
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
			var action = event.button === 0
				// left mouse button
				? ( event.ctrlKey || event.metaKey
					// with modifier key
					? get( this, "settings.stream_click_modify" )
					// without modifier keys (default action)
					: actions.launch
				)
				: event.button === 1
				// middle mouse button
				? get( this, "settings.stream_click_middle" )
				// everything else (no action)
				: -1;

			switch ( action ) {
				case actions.launch:
					return this.startStream();
				case actions.chat:
					return this.openChat();
				case actions.channel:
					return this.gotoChannelPage();
				case actions.settings:
					return this.gotoChannelSettings();
			}
		}

		if ( this.attrs.action instanceof Function ) {
			this.attrs.action();
		}
	},

	contextMenu( event ) {
		if ( this.attrs.noContextmenu ) { return; }

		var menu = Menu.create();

		var quals = qualities.map(function( quality ) {
			return {
				label: quality.label,
				click: this.startStream.bind( this, quality.id )
			};
		}, this );

		if ( get( this, "stream" ) ) {
			if ( get( this, "opened" ) ) {
				menu.items.pushObjects([
					{
						label  : "Close stream",
						click  : this.closeStream.bind( this )
					},
					{
						label  : "Change quality",
						submenu: quals
					}
				]);
			} else {
				menu.items.pushObjects([
					{
						label  : "Launch stream",
						submenu: quals
					}
				]);
			}
		}

		menu.items.pushObjects([
			{
				label: "Open chat",
				click: this.openChat.bind( this )
			},
			{
				label: "Copy channel URL",
				click: this.copyChannelURL.bind( this )
			}
		]);

		if ( !this.attrs.contextmenuNoGotos ) {
			menu.items.pushObjects([
				{
					label: "Channel page",
					click: this.gotoChannelPage.bind( this )
				},
				{
					label: "Channel settings",
					click: this.gotoChannelSettings.bind( this )
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
		let channel = get( this, "stream.channel" );
		get( this, "chat" ).open( channel );
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
