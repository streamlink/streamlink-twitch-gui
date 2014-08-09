define( [ "ember", "utils/semver" ], function( Ember, SemVer ) {

	return Ember.ObjectController.extend({
		needs: [ "modal" ],

		// check again in 3 days (time in ms)
		time: 1000 * 3600 * 24 * 3,


		check: function( ApplicationModel ) {
			var version = Ember.get( ApplicationModel, "package.version" );
			if ( !version ) { return; }

			// Load Versioncheck record
			this.store.find( "versioncheck" ).then(function( records ) {
				var content = records.toArray();
				if ( !content.length || Ember.get( content, "0.checkagain" ) <= +new Date() ) {
					// let's check for a new release
					this.checkReleases( version );
				}
			}.bind( this ) );
		},

		checkReleases: function( version ) {
			function getVers( record ) {
				return Ember.get( record, "tag_name" );
			}

			this.store.find( "githubReleases" ).then(function( releases ) {
				// filter records first
				return releases.toArray().filter(function( release ) {
					// ignore drafts
					return !release.get( "draft" );
				});
			}).then(function( releases ) {
				var	modal	= this.get( "controllers.modal" ),

				// create a fake record for the current version and save a reference
					current	= { tag_name: "v" + version },
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
							this.releaseDownload.bind( this, Ember.get( latest, "html_url" ) )
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
			this.store.find( "versioncheck" ).then(function( record ) {
				if ( record = record.content[0] ) {
					record.set( "checkagain", +new Date() + this.time );
					record.save();
				} else {
					this.store.createRecord( "versioncheck", {
						id: 1,
						checkagain: +new Date() + this.time
					}).save();
				}
			}.bind( this ) );
		}
	});

});
