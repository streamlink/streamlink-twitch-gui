import Ember from "Ember";
import Menu from "nwjs/menu";
import clipboard from "nwjs/clipboard";
import Settings from "models/localstorage/Settings";
import layout from "templates/components/stream/StreamPreviewImageComponent.hbs";


var get = Ember.get;
var getOwner = Ember.getOwner;

var actions = Settings.stream_click.reduce(function( obj, item ) {
	obj[ item.key ] = item.id;
	return obj;
}, {} );


export default Ember.Component.extend({
	settings    : Ember.inject.service(),
	livestreamer: Ember.inject.service(),
	chat        : Ember.inject.service(),

	layout: layout,
	tagName: "div",
	classNameBindings: [ ":preview", "class", "opened:opened" ],
	attributeBindings: [ "title", "noMiddleclickScroll:data-no-middleclick-scroll" ],
	"class": "",
	noMiddleclickScroll: function() {
		// true or null
		return get( this, "settings.stream_click_middle" ) !== actions.disabled || null;
	}.property( "settings.stream_click_middle" ),

	init: function() {
		this._super.apply( this, arguments );
		// FIXME: refactor global goto actions
		this.applicationRoute = getOwner( this ).lookup( "route:application" );
	},

	clickable: true,


	opened: function() {
		var model = get( this, "livestreamer.model" );
		var id    = get( this, "stream.channel.id" );

		return model.mapBy( "channel.id" ).indexOf( id ) !== -1;
	}.property( "stream.channel.id", "livestreamer.model.length" ),


	mouseUp: function( event ) {
		if ( event.button === 1 ) {
			this.click( event );
		}
	},

	click: function( event ) {
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

	contextMenu: function( event ) {
		if ( this.attrs.noContextmenu ) { return; }

		var menu = Menu.create();

		var qualities = Settings.qualities.map(function( quality ) {
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
						submenu: qualities
					}
				]);
			} else {
				menu.items.pushObjects([
					{
						label  : "Launch stream",
						submenu: qualities
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


	startStream: function( quality ) {
		var stream = get( this, "stream" );
		get( this, "livestreamer" ).startStream( stream, quality );
	},

	closeStream: function() {
		var stream = get( this, "stream" );
		get( this, "livestreamer" ).closeStream( stream );
	},

	openChat: function() {
		var channel = get( this, "stream.channel" );
		get( this, "chat" ).open( channel );
	},

	copyChannelURL: function() {
		var url = get( this, "stream.channel.url" );
		clipboard.set( url );
	},

	gotoChannelPage: function() {
		var name = get( this, "stream.channel.id" );
		this.applicationRoute.send( "goto", "channel", name );
	},

	gotoChannelSettings: function() {
		var name = get( this, "stream.channel.id" );
		this.applicationRoute.send( "goto", "channel.settings", name );
	}

});
