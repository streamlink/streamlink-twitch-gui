define([
	"Ember",
	"components/modal/ModalDialogComponent",
	"hbs!templates/components/modal/ModalChangelogComponent"
], function(
	Ember,
	ModalDialogComponent,
	layout
) {

	var get = Ember.get;
	var readOnly = Ember.computed.readOnly;


	return ModalDialogComponent.extend({
		metadata: Ember.inject.service(),

		layout: layout,
		"class": "modal-changelog",

		openBrowser: "openBrowser",

		version: readOnly( "metadata.package.version" ),
		changelogUrl: readOnly( "metadata.config.changelog-url" ),


		actions: {
			"showChangelog": function( success ) {
				var version = get( this, "version" );
				var url     = get( this, "changelogUrl" );

				if ( version && url ) {
					url = url.replace( "{version}", version );
					this.sendAction( "openBrowser", url );

					if ( success instanceof Function ) {
						success();
					}
				}

				this.send( "close" );
			}
		}
	});

});
