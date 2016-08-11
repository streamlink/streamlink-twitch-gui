define([
	"Ember",
	"config",
	"components/modal/ModalDialogComponent",
	"models/localstorage/Settings",
	"nwjs/openBrowser",
	"templates/components/modal/ModalLivestreamerComponent.hbs"
], function(
	Ember,
	config,
	ModalDialogComponent,
	Settings,
	openBrowser,
	layout
) {

	var get = Ember.get;
	var set = Ember.set;
	var schedule = Ember.run.schedule;
	var readOnly = Ember.computed.readOnly;

	var livestreamerDownloadUrl = config.livestreamer[ "download-url" ];


	return ModalDialogComponent.extend({
		livestreamer: Ember.inject.service(),

		layout: layout,
		"class": "modal-livestreamer",

		error : readOnly( "livestreamer.error" ),
		active: readOnly( "livestreamer.active" ),

		qualities: Settings.qualities,
		versionMin: config.livestreamer[ "version-min" ],


		actions: {
			"download": function( success ) {
				if ( livestreamerDownloadUrl ) {
					openBrowser( livestreamerDownloadUrl );
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
				get( this, "modal" ).closeModal( get( this, "livestreamer" ) );
			},

			"close": function() {
				get( this, "modal" ).closeModal( get( this, "livestreamer" ) );
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
