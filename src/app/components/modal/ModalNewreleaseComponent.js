define([
	"Ember",
	"components/modal/ModalDialogComponent",
	"nwjs/openBrowser",
	"hbs!templates/components/modal/ModalNewreleaseComponent"
], function(
	Ember,
	ModalDialogComponent,
	openBrowser,
	layout
) {

	var get = Ember.get;
	var readOnly = Ember.computed.readOnly;


	return ModalDialogComponent.extend({
		versioncheck: Ember.inject.service(),

		layout: layout,
		"class": "modal-newrelease",

		outdated: readOnly( "versioncheck.versionOutdated" ),
		latest  : readOnly( "versioncheck.versionLatest" ),


		actions: {
			"download": function( success ) {
				var url = get( this, "versioncheck.downloadURL" );
				if ( url ) {
					openBrowser( url );
					if ( success instanceof Function ) {
						success();
					}
				}

				this.send( "ignore" );
			},

			"ignore": function() {
				get( this, "versioncheck" ).ignoreRelease();
				this.send( "close" );
			}
		}
	});

});
