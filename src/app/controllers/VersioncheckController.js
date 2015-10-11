define([
	"Ember",
	"nwjs/argv",
	"utils/semver"
], function(
	Ember,
	argv,
	semver
) {

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
			if ( !argv.versioncheck ) { return; }
			if ( !get( this, "version" ) ) { return; }

			var getReleases = this.getReleases.bind( this );

			// load Versioncheck record
			get( this, "store" ).findRecord( "versioncheck", 1 ).then(function( record ) {
				if ( Ember.getWithDefault( record, "checkagain", 0 ) <= +new Date() ) {
					// let's check for a new release
					getReleases();
				}
			}, getReleases );
		}.on( "init" ),

		getReleases: function() {
			get( this, "store" ).findAll( "githubReleases", { reload: true } )
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
				versionOutdated: getVers( current ),
				versionLatest  : getVers( latest ),
				downloadURL    : get( latest, "html_url" )
			});
		},

		actions: {
			"releaseDownload": function( success ) {
				this.send( "openBrowser", get( this, "downloadURL" ) );
				this.send( "releaseIgnore" );
				if ( success instanceof Function ) {
					success();
				}
			},

			"releaseIgnore": function( success, failure ) {
				var store  = get( this, "store" );
				var record = store.peekRecord( "versioncheck", 1 );
				if ( record ) {
					store.unloadRecord( record );
				}

				store.createRecord( "versioncheck", {
					id: 1,
					checkagain: +new Date() + get( this, "time" )
				})
					.save()
					.then( success, failure )
					.then( this.send.bind( this, "closeModal" ) );
			}
		}
	});

});
