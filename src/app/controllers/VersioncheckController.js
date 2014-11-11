define( [ "ember", "utils/semver" ], function( Ember, SemVer ) {

	var get = Ember.get;

	return Ember.ObjectController.extend({
		needs: [ "modal" ],

		packageBinding: "metadata.package",
		versionBinding: "package.version",

		// check again in x days (time in ms)
		time: function() {
			var days = Number( get( this, "package.config.version-check-days" ) );
			return 1000 * 3600 * 24 * days;
		}.property( "package.config.version-check-days" ),


		check: function() {
			if ( !get( this, "version" ) ) { return; }

			var checkReleases = this.checkReleases.bind( this );

			// Load Versioncheck record
			this.store.find( "versioncheck", 1 ).then(function( record ) {
				if ( Ember.getWithDefault( record, "checkagain", 0 ) <= +new Date() ) {
					// let's check for a new release
					checkReleases();
				}
			}, checkReleases );
		},

		checkReleases: function() {
			function getVers( record ) {
				return get( record, "tag_name" );
			}

			this.store.find( "githubReleases" ).then(function( releases ) {
				// filter records first
				releases = releases.toArray().filter(function( release ) {
					// ignore drafts
					return !get( release, "draft" );
				});

				var	modal	= get( this, "controllers.modal" ),

				// create a fake record for the current version and save a reference
					current	= { tag_name: "v" + get( this, "version" ) },
				// find out the maximum of fetched releases
					maximum	= SemVer.getMax( releases, getVers ),
				// and compare it with the current version
					latest	= SemVer.getMax( [ current, maximum ], getVers );

				// no new release? check again in a few days
				if ( latest === current || getVers( current ) === getVers( maximum ) ) {
					return this.releaseIgnore();
				}

				// ask the user what to do
				this.send( "openModal",
					"You're using an outdated version: " + getVers( current ),
					"Do you want to download the latest release now? (" + getVers( maximum ) + ")",
					[
						new modal.Button(
							"Download", "btn-success", "fa-download",
							this.releaseDownload.bind( this, get( latest, "html_url" ) )
						),
						new modal.Button(
							"Ignore", "btn-danger", "fa-times",
							this.releaseIgnore.bind( this )
						)
					]
				);
			}.bind( this ) );
		},

		releaseDownload: function( url ) {
			this.send( "openBrowser", url );
			this.releaseIgnore();
		},

		releaseIgnore: function() {
			var	store = this.store,
				data = { checkagain: +new Date() + get( this, "time" ) };

			this.store.find( "versioncheck", 1 ).then(function( record ) {
				record.setProperties( data ).save();
			}, function() {
				data.id = 1;
				store.createRecord( "versioncheck", data ).save();
			});
		}
	});

});
