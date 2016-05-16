define([
	"Ember",
	"config",
	"nwjs/nwGui",
	"components/modal/ModalDialogComponent",
	"nwjs/openBrowser",
	"hbs!templates/components/modal/ModalChangelogComponent"
], function(
	Ember,
	config,
	nwGui,
	ModalDialogComponent,
	openBrowser,
	layout
) {

	var get = Ember.get;

	var changelogUrl = config.update[ "changelog-url" ];


	return ModalDialogComponent.extend({
		layout: layout,
		"class": "modal-changelog",

		version: nwGui.App.manifest.version,


		actions: {
			"showChangelog": function( success ) {
				var version = get( this, "version" );

				if ( version && changelogUrl ) {
					var url = changelogUrl.replace( "{version}", version );
					openBrowser( url );

					if ( success instanceof Function ) {
						success();
					}
				}

				this.send( "close" );
			}
		}
	});

});
