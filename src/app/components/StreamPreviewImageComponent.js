define([
	"Ember",
	"models/localstorage/Settings",
	"hbs!templates/components/StreamPreviewImage"
], function(
	Ember,
	Settings,
	layout
) {

	var get = Ember.get;

	var actions = Settings.gui_streamclick.reduce(function( obj, item ) {
		obj[ item.key ] = item.id;
		return obj;
	}, {} );


	return Ember.Component.extend({
		chat    : Ember.inject.service(),
		settings: Ember.inject.service(),

		layout: layout,
		tagName: "div",
		classNameBindings: [ ":preview", "class" ],
		attributeBindings: [ "title", "noMiddleclickScroll:data-no-middleclick-scroll" ],
		"class": "",
		noMiddleclickScroll: function() {
			// true or null
			return get( this, "settings.gui_streamclick_mid" ) !== actions.disabled || null;
		}.property( "settings.gui_streamclick_mid" ),

		init: function() {
			this._super.apply( this, arguments );
			this.applicationRoute = this.container.lookup( "route:application" );
		},

		clickable: true,

		mouseUp: function( event ) {
			if ( event.button === 1 ) {
				this.click( event );
			}
		},

		click: function( event ) {
			if ( get( this, "clickable" ) ) {
				var stream = get( this, "stream" );
				var channel = get( stream, "channel" );
				var name = get( channel, "id" );
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

				// FIXME: refactor global openLivestreamer and goto actions
				switch ( action ) {
					case actions.launch:
						return this.applicationRoute.send( "openLivestreamer", stream );
					case actions.chat:
						return get( this, "chat" ).open( channel );
					case actions.channel:
						return this.applicationRoute.send( "goto", "channel", name );
					case actions.settings:
						return this.applicationRoute.send( "goto", "channel.settings", name );
				}
			}

			if ( this.attrs.action instanceof Function ) {
				this.attrs.action();
			}
		}
	});

});
