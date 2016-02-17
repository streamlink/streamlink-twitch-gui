define([
	"Ember",
	"nwjs/nwWindow"
], function(
	Ember,
	nwWindow
) {

	var get = Ember.get;
	var readOnly = Ember.computed.readOnly;


	return Ember.Controller.extend({
		auth        : Ember.inject.service(),
		modal       : Ember.inject.service(),
		notification: Ember.inject.service(),
		settings    : Ember.inject.service(),
		livestreamer: Ember.inject.service(),

		dev: DEBUG,

		streamsLength: readOnly( "livestreamer.model.length" ),

		nl: "\n",


		actions: {
			"winRefresh": function() {
				nwWindow.reloadIgnoringCache();
			},

			"winDevTools": function() {
				nwWindow.showDevTools();
			},

			"winMin": function() {
				var integration    = get( this, "settings.gui_integration" ),
				    minimizetotray = get( this, "settings.gui_minimizetotray" );

				// tray only or both with min2tray: just hide the window
				if ( integration === 2 || integration === 3 && minimizetotray ) {
					nwWindow.toggleVisibility( false );
				} else {
					nwWindow.toggleMinimize( false );
				}
			},

			"winMax": function() {
				nwWindow.toggleMaximize();
			},

			"winClose": function() {
				if ( get( this, "streamsLength" ) ) {
					get( this, "modal" ).openModal( "quit" );
				} else {
					nwWindow.close( true );
				}
			}
		}
	});

});
