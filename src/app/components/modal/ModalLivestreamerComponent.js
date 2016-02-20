define([
	"Ember",
	"components/modal/ModalDialogComponent",
	"models/localstorage/Settings",
	"hbs!templates/components/modal/ModalLivestreamerComponent"
], function(
	Ember,
	ModalDialogComponent,
	Settings,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;
	var schedule = Ember.run.schedule;
	var readOnly = Ember.computed.readOnly;


	return ModalDialogComponent.extend({
		metadata    : Ember.inject.service(),
		livestreamer: Ember.inject.service(),

		layout: layout,
		"class": "modal-livestreamer",

		openBrowser: "openBrowser",

		error : readOnly( "livestreamer.error" ),
		active: readOnly( "livestreamer.active" ),

		qualities: Settings.qualities,


		actions: {
			"download": function( success ) {
				var url = get( this, "metadata.config.livestreamer-download-url" );
				if ( url ) {
					this.sendAction( "openBrowser", url );
					if ( success instanceof Function ) {
						success();
					}
				}
			},

			"chat": function( channel ) {
				get( this, "livestreamer" ).openChat( channel );
			},

			"abort": function() {
				set( this, "livestreamer.abort", true );
				get( this, "modal" ).closeModal();
			},

			"close": function() {
				get( this, "modal" ).closeModal();
				schedule( "destroy", this, function() {
					set( this, "livestreamer.active", null );
				});
			},

			"shutdown": function() {
				var active = get( this, "active" );
				if ( active ) {
					active.kill();
				}
				this.send( "close" );
			},

			"toggleLog": function() {
				var active = get( this, "active" );
				if ( active ) {
					active.toggleProperty( "showLog" );
				}
			}
		}
	});

});
