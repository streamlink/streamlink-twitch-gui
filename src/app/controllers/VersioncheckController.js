define( [ "Ember", "utils/semver" ], function( Ember, semver ) {

	var get = Ember.get;
	var alias = Ember.computed.alias;

	return Ember.Controller.extend({
		metadata: Ember.inject.service(),

		config : alias( "metadata.config" ),
		version: alias( "metadata.package.version" ),

		// check again in x days (time in ms)
		time: function() {
			var days = Number( get( this, "config.version-check-days" ) );
			return 1000 * 3600 * 24 * days;
		}.property( "config.version-check-days" ),


		check: function() {
			if ( !get( this, "version" ) ) { return; }

			var getReleases = this.getReleases.bind( this );

			// load Versioncheck record
			this.store.find( "versioncheck", 1 ).then(function( record ) {
				if ( Ember.getWithDefault( record, "checkagain", 0 ) <= +new Date() ) {
					// let's check for a new release
					getReleases();
				}
			}, getReleases );
		}.on( "init" ),

		getReleases: function() {
			this.store.find( "githubReleases" )
				.then(function( releases ) {
					// filter records first
					return releases.toArray().filter(function( release ) {
						// ignore drafts
						return !get( release, "draft" );
					});
				})
				.then( this.checkReleases.bind( this ) );
		},

		checkReleases: function( releases ) {
			function getVers( record ) {
				return get( record, "tag_name" );
			}

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
		},

		actions: {
			"releaseDownload": function( callback ) {
				this.send( "openBrowser", get( this, "downloadURL" ) );
				this.send( "releaseIgnore" );
				if ( callback instanceof Function ) {
					callback();
				}
			},

			"releaseIgnore": function( callback ) {
				var store  = this.store;
				var record = store.getById( "versioncheck", 1 );
				if ( record ) {
					store.unloadRecord( record );
				}

				store.createRecord( "versioncheck", {
					id: 1,
					checkagain: +new Date() + get( this, "time" )
				})
					.save()
					.then( callback )
					.then( this.send.bind( this, "closeModal" ) );
			}
		}
	});

});
