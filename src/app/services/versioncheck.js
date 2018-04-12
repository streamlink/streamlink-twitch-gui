import { get, set } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";
import { update } from "config";
import { manifest } from "nwjs/App";
import { argv, ARG_VERSIONCHECK } from "nwjs/argv";
import { getMax } from "utils/semver";


const { "check-again": checkAgain } = update;
const { version } = manifest;


export default Service.extend({
	modal: service(),
	store: service(),

	version,


	model: null,


	check() {
		// get the installed version
		let current = get( this, "version" );
		if ( !current ) { return; }

		const store = get( this, "store" );
		store.findRecord( "versioncheck", 1 )
			.then(
				// versioncheck record found: existing user
				record => this.notFirstRun( record ),
				// versioncheck record not found: new user
				() => this.firstRun()
			)
			.then( modalSkipped => {
				if ( !modalSkipped ) { return; }
				// go on with new version check if no modal has been opened
				this.checkForNewRelease();
			});
	},

	notFirstRun( record ) {
		set( this, "model", record );

		let current = get( this,   "version" );
		let version = get( record, "version" );

		// if version string is empty, go on (new version)
		// ignore if version string >= (not <) installed version metadata
		if ( version && getMax([ version, current ]) === version ) {
			return true;
		}

		// NEW version -> upgrade record
		set( record, "version", current );
		record.save();

		// don't show modal if versioncheck is enabled (manual upgrades)
		// manual upgrades -> user has (most likely) seen changelog already
		if ( argv[ ARG_VERSIONCHECK ] ) {
			return true;
		}

		// show changelog modal dialog
		get( this, "modal" ).openModal( "changelog" );
	},

	firstRun() {
		const store   = get( this, "store" );
		const version = get( this, "version" );

		// unload automatically created record and create a new one instead
		let record = store.peekRecord( "versioncheck", 1 );
		if ( record ) {
			store.unloadRecord( record );
		}
		record = store.createRecord( "versioncheck", {
			id: 1,
			version
		});
		record.save();

		set( this, "model", record );

		// show first run modal dialog
		get( this, "modal" ).openModal( "firstrun", this );
	},


	checkForNewRelease() {
		// don't check for new releases if disabled
		if ( !argv[ ARG_VERSIONCHECK ] ) { return; }

		let checkagain = get( this, "model.checkagain" );
		if ( checkagain <= +new Date() ) {
			this.getReleases();
		}
	},

	getReleases() {
		get( this, "store" ).findRecord( "githubReleases", "latest", { reload: true } )
			.then( release => this.checkRelease( release ) );
	},

	checkRelease( release ) {
		let latest = get( release, "tag_name" );
		let version = get( this, "version" );
		let current = `v${version}`;

		// no new release? check again in a few days
		if ( current === getMax([ current, latest ]) ) {
			return this.ignoreRelease();
		}

		// ask the user what to do
		get( this, "modal" ).openModal( "newrelease", this, {
			versionOutdated: current,
			versionLatest  : latest,
			downloadURL    : get( release, "html_url" )
		});
	},

	ignoreRelease() {
		let record = get( this, "model" );
		record.set( "checkagain", +new Date() + checkAgain );

		return record.save();
	}
});
