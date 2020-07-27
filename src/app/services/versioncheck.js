import { set } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";
import semver from "semver";
import { update as updateConfig } from "config";
import { manifest } from "nwjs/App";
import { argv, ARG_VERSIONCHECK } from "nwjs/argv";


const { "check-again": checkAgain } = updateConfig;
const { version } = manifest;


export default Service.extend( /** @class VersioncheckService */ {
	/** @type {ModalService} */
	modal: service(),
	/** @type {DS.Store} */
	store: service(),

	version,

	/** @type {Versioncheck} */
	model: null,
	/** @type {GithubReleases} */
	release: null,


	async check() {
		try {
			/** @type {Versioncheck} */
			const record = await this.store.findRecord( "versioncheck", 1 );
			// versioncheck record found: existing user
			set( this, "model", record );
			await this._notFirstRun();

		} catch ( e ) {
			// versioncheck record not found: new user
			await this._firstRun();
		}
	},

	async ignoreRelease() {
		const { model } = this;
		set( model, "checkagain", Date.now() + checkAgain );

		await model.save();
	},


	async _notFirstRun() {
		const { model, version } = this;
		// is previous version string empty or lower than current version?
		if ( !model.version || semver.lt( model.version, version ) ) {
			// NEW version -> update record
			set( model, "version", version );
			await model.save();

			// don't show changelog modal if versioncheck is enabled
			// manual upgrades mean that the user has (most likely) seen the changelog already
			if ( !argv[ ARG_VERSIONCHECK ] ) {
				this._openModalAndCheckForNewRelease( "changelog" );
				return;
			}
		}

		// go on with new version check if no modal was opened
		await this._checkForNewRelease();
	},

	async _firstRun() {
		const { store, version } = this;

		// unload automatically created record and create a new one instead
		/** @type {Versioncheck} */
		let record = store.peekRecord( "versioncheck", 1 );
		/* istanbul ignore next */
		if ( record ) {
			store.unloadRecord( record );
		}

		record = store.createRecord( "versioncheck", {
			id: 1,
			version
		});
		await record.save();
		set( this, "model", record );

		// show first run modal dialog
		this._openModalAndCheckForNewRelease( "firstrun" );
	},

	_openModalAndCheckForNewRelease( name ) {
		this.modal.promiseModal( name, this )
			.then( () => this._checkForNewRelease() );
	},

	async _checkForNewRelease() {
		// don't check for new releases if disabled or re-check threshold not yet reached
		if ( !argv[ ARG_VERSIONCHECK ] || Date.now() < this.model.checkagain ) { return; }

		/** @type {GithubReleases} */
		const release = await this.store.queryRecord( "github-releases", "latest" );
		set( this, "release", release );

		if ( semver.gte( this.version, release.version ) ) {
			return this.ignoreRelease();
		}

		this.modal.openModal( "newrelease", this );
	}
});
