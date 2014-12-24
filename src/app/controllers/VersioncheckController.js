define( [ "ember", "utils/semver" ], function( Ember, semver ) {

	var get = Ember.get;

	return Ember.Controller.extend({
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

			// load Versioncheck record
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

				// create a fake record for the current version and save a reference
				var current = { tag_name: "v" + get( this, "version" ) };
				// find out the maximum of fetched releases
				var maximum = semver.getMax( releases, getVers );
				// and compare it with the current version
				var latest  = semver.getMax( [ current, maximum ], getVers );

				// no new release? check again in a few days
				if ( current === latest || getVers( current ) === getVers( latest ) ) {
					return this.send( "releaseIgnore" );
				}

				// ask the user what to do
				this.send( "openModal", "versioncheckModal", this, {
					modalHead: "You're using an outdated version: %@".fmt(
						getVers( current )
					),
					modalBody: "Do you want to download the latest release now? (%@)".fmt(
						getVers( latest )
					),
					downloadURL: get( latest, "html_url" )
				});
			}.bind( this ) );
		},

		actions: {
			releaseDownload: function() {
				this.send( "openBrowser", get( this, "downloadURL" ) );
				this.send( "releaseIgnore" );
			},

			releaseIgnore: function() {
				var store = this.store,
				    data  = { checkagain: +new Date() + get( this, "time" ) };

				this.store.find( "versioncheck", 1 ).then(function( record ) {
					record.setProperties( data ).save();
				}, function() {
					data.id = 1;
					store.createRecord( "versioncheck", data ).save();
				});

				this.send( "closeModal" );
			}
		}
	});

});
