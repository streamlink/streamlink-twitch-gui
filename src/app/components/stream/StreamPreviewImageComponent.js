define([
	"Ember",
	"nwjs/menu",
	"nwjs/clipboard",
	"models/localstorage/Settings",
	"hbs!templates/components/stream/StreamPreviewImageComponent"
], function(
	Ember,
	Menu,
	clipboard,
	Settings,
	layout
) {

	var get = Ember.get;

	var actions = Settings.gui_streamclick.reduce(function( obj, item ) {
		obj[ item.key ] = item.id;
		return obj;
	}, {} );


	return Ember.Component.extend({
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
			return get( this, "settings.gui_streamclick_mid" ) !== actions.disabled || null;
		}.property( "settings.gui_streamclick_mid" ),

		init: function() {
			this._super.apply( this, arguments );
			// FIXME: refactor global goto actions
			this.applicationRoute = this.container.lookup( "route:application" );
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
						? get( this, "settings.gui_streamclick_mod" )
						// without modifier keys (default action)
						: actions.launch
					)
					: event.button === 1
					// middle mouse button
					? get( this, "settings.gui_streamclick_mid" )
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

			menu.items.pushObjects([
				{
					label  : "Launch stream",
					submenu: Settings.qualities.map(function( quality ) {
						return {
							label: quality.label,
							click: this.startStream.bind( this, quality.id )
						};
					}, this )
				},
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

});
