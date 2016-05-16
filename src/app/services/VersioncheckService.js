define([
	"Ember",
	"config",
	"nwjs/argv",
	"utils/semver"
], function(
	Ember,
	config,
	argv,
	semver
) {

	var get = Ember.get;
	var set = Ember.set;
	var readOnly = Ember.computed.readOnly;


	var checkAgain = config.update[ "check-again" ];


	return Ember.Service.extend({
		store   : Ember.inject.service(),
		metadata: Ember.inject.service(),
		modal   : Ember.inject.service(),

		version: readOnly( "metadata.package.version" ),


		model: null,


		check: function() {
			// get the installed version
			var current = get( this, "version" );
			if ( !current ) { return; }

			var self  = this;
			var store = get( self, "store" );
			store.findRecord( "versioncheck", 1 )
				.then(
					// versioncheck record found: existing user
					this.notFirstRun.bind( this ),
					// versioncheck record not found: new user
					this.firstRun.bind( this )
				)
				.then(function( modalSkipped ) {
					if ( !modalSkipped ) { return; }
					// go on with new version check if no modal has been opened
					self.checkForNewRelease();
				});
		},

		notFirstRun: function( record ) {
			set( this, "model", record );

			var current = get( this,   "version" );
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
			get( this, "modal" ).openModal( "changelog" );
		},

		firstRun: function() {
			var store   = get( this, "store" );
			var current = get( this, "version" );

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

			set( this, "model", record );

			// show first run modal dialog
			get( this, "modal" ).openModal( "firstrun", this );
		},


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
				return this.ignoreRelease();
			}

			// ask the user what to do
			get( this, "modal" ).openModal( "newrelease", this, {
				versionOutdated: getVers( current ),
				versionLatest  : getVers( latest ),
				downloadURL    : get( latest, "html_url" )
			});
		},

		ignoreRelease: function() {
			var record = get( this, "model" );
			record.set( "checkagain", +new Date() + checkAgain );

			return record.save();
		}
	});

});
