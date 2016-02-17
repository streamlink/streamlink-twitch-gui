define([
	"Ember",
	"components/ModalDialogComponent",
	"hbs!templates/modal/ModalNewrelease"
], function(
	Ember,
	ModalDialogComponent,
	layout
) {

	var get = Ember.get;
	var readOnly = Ember.computed.readOnly;


	return ModalDialogComponent.extend({
		versioncheck: Ember.inject.service(),

		layout: layout,
		"class": "modal-newrelease",

		openBrowser: "openBrowser",

		outdated: readOnly( "versioncheck.versionOutdated" ),
		latest  : readOnly( "versioncheck.versionLatest" ),


		actions: {
			"download": function( success ) {
				var url = get( this, "versioncheck.downloadURL" );
				if ( url ) {
					this.sendAction( "openBrowser", url );
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
