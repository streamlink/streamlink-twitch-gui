define([
	"Ember",
	"config",
	"components/modal/ModalDialogComponent",
	"nwjs/openBrowser",
	"hbs!templates/components/modal/ModalChangelogComponent"
], function(
	Ember,
	config,
	ModalDialogComponent,
	openBrowser,
	layout
) {

	var get = Ember.get;
	var readOnly = Ember.computed.readOnly;

	var changelogUrl = config.update[ "changelog-url" ];


	return ModalDialogComponent.extend({
		metadata: Ember.inject.service(),

		layout: layout,
		"class": "modal-changelog",

		version: readOnly( "metadata.package.version" ),


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
