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
	var set = Ember.set;
	var readOnly = Ember.computed.readOnly;

	return Ember.Controller.extend({
		metadata: Ember.inject.service(),
		modal   : Ember.inject.service(),

		config : readOnly( "metadata.config" ),
		version: readOnly( "metadata.package.version" ),

		// check again in x days (time in ms)
		time: function() {
			var days = Number( get( this, "config.version-check-days" ) );
			return 1000 * 3600 * 24 * days;
		}.property( "config.version-check-days" ),


		model: null,


		check: function() {
			// get the installed version
			var current = get( this, "version" );
			if ( !current ) { return; }

			var self  = this;
			var store = get( self, "store" );
			store.findRecord( "versioncheck", 1 )
				.then(function( record ) {
					// versioncheck record found

					set( self, "model", record );

					var version = get( record, "version" );
					// if version string is empty, go on (new version)
					// ignore if version string >= (not <) installed version metadata
					if ( version && semver.getMax([ version, current ]) === version ) {
						return true;
					}

					// NEW version -> upgrade record
					set( record, "version", current );
					record.save();

					// don't show modal if versioncheck is enabled (manual upgrades)
					// manual upgrades -> user has (most likely) seen changelog already
					if ( argv.versioncheck ) {
						return true;
					}

					// show changelog modal dialog
					get( self, "modal" ).openModal( "changelog", self );

				}, function() {
					// no versioncheck record found: first run

					// unload automatically created record and create a new one instead
					var record = store.peekRecord( "versioncheck", 1 );
					if ( record ) {
						store.unloadRecord( record );
					}
					record = store.createRecord( "versioncheck", {
						id     : 1,
						version: current
					});
					record.save();

					set( self, "model", record );

					// show first run modal dialog
					get( self, "modal" ).openModal( "firstrun", self );
				})
				.then(function( modalSkipped ) {
					if ( !modalSkipped ) { return; }
					// go on with new version check if no modal has been opened
					self.checkForNewRelease();
				});
		}.on( "init" ),


		checkForNewRelease: function() {
			// don't check for new releases if disabled
			if ( !argv.versioncheck ) { return; }

			var checkagain = get( this, "model.checkagain" );
			if ( checkagain <= +new Date() ) {
				this.getReleases();
			}
		},

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
			get( this, "modal" ).openModal( "newrelease", this, {
				versionOutdated: getVers( current ),
				versionLatest  : getVers( latest ),
				downloadURL    : get( latest, "html_url" )
			});
		},

		actions: {
			"close": function() {
				get( this, "modal" ).closeModal();
				this.checkForNewRelease();
			},

			"gotoSettings": function() {
				this.send( "goto", "settings" );
				this.send( "close" );
			},

			"showChangelog": function( success ) {
				var version = get( this, "version" );
				var url = get( this, "config.changelog-url" );
				if ( url ) {
					url = url.replace( "{version}", version );
					this.send( "openBrowser", url );
					if ( success instanceof Function ) {
						success();
					}
				}
			},

			"releaseDownload": function( success ) {
				var url = get( this, "downloadURL" );
				this.send( "openBrowser", url );
				this.send( "releaseIgnore" );
				if ( success instanceof Function ) {
					success();
				}
			},

			"releaseIgnore": function( success ) {
				var modal      = get( this, "modal" );
				var record     = get( this, "model" );
				var time       = get( this, "time" );
				var checkagain = +new Date() + time;

				record.set( "checkagain", checkagain );
				record.save()
					.then( success, function(){} )
					.then( modal.closeModal.bind( modal ) );
			}
		}
	});

});
