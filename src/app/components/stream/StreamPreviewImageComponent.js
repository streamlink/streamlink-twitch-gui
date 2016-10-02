import {
	get,
	getOwner,
	computed,
	inject,
	Component
} from "Ember";
import Menu from "nwjs/menu";
import { set as setClipboard } from "nwjs/clipboard";
import Settings from "models/localstorage/Settings";
import qualities from "models/LivestreamerQualities";
import layout from "templates/components/stream/StreamPreviewImageComponent.hbs";


const { service } = inject;

const actions = Settings.stream_click.reduce(function( obj, item ) {
	obj[ item.key ] = item.id;
	return obj;
}, {} );


export default Component.extend({
	chat: service(),
	livestreamer: service(),
	settings: service(),

	layout,

	tagName: "div",
	classNameBindings: [ ":preview", "class", "opened:opened" ],
	attributeBindings: [ "title", "noMiddleclickScroll:data-no-middleclick-scroll" ],
	"class": "",
	noMiddleclickScroll: computed( "settings.stream_click_middle", function() {
		// true or null
		return get( this, "settings.stream_click_middle" ) !== actions.disabled || null;
	}),

	init() {
		this._super.apply( this, arguments );
		// FIXME: refactor global goto actions
		this.applicationRoute = getOwner( this ).lookup( "route:application" );
	},

	clickable: true,


	opened: computed( "stream.channel.id", "livestreamer.model.length", function() {
		var model = get( this, "livestreamer.model" );
		var id    = get( this, "stream.channel.id" );

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
		var stream = get( this, "stream" );
		get( this, "livestreamer" ).startStream( stream, quality );
	},

	closeStream() {
		var stream = get( this, "stream" );
		get( this, "livestreamer" ).closeStream( stream );
	},

	openChat() {
		var channel = get( this, "stream.channel" );
		get( this, "chat" ).open( channel );
	},

	copyChannelURL() {
		var url = get( this, "stream.channel.url" );
		setClipboard( url );
	},

	gotoChannelPage() {
		var name = get( this, "stream.channel.id" );
		this.applicationRoute.send( "goto", "channel", name );
	},

	gotoChannelSettings() {
		var name = get( this, "stream.channel.id" );
		this.applicationRoute.send( "goto", "channel.settings", name );
	}

});
