import { set } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";
import semver from "semver";
import { main as mainConfig, update as updateConfig } from "config";
import { version as buildVersion } from "metadata";
import { manifest } from "nwjs/App";
import { argv, ARG_VERSIONCHECK } from "nwjs/argv";
import { isDebug, isDevelopment } from "nwjs/debug";


const { "display-name": displayName } = mainConfig;
const { "check-again": checkAgain, "show-debug-message": showDebugMessage } = updateConfig;
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
		const existinguser = await this._getRecord();
		await this._showDebugMessage();
		await this._check( existinguser );
	},

	async ignoreRelease() {
		const { model } = this;
		set( model, "checkagain", Date.now() + checkAgain );

		await model.save();
	},


	async _getRecord() {
		const { store, version } = this;

		/** @type {Versioncheck} */
		let record = null;
		let existinguser = false;

		try {
			record = await store.findRecord( "versioncheck", 1 );
			// versioncheck record found: existing user
			existinguser = true;

		} catch ( e ) {
			// unload automatically created record and create a new one instead
			record = store.peekRecord( "versioncheck", 1 );
			/* istanbul ignore next */
			if ( record ) {
				store.unloadRecord( record );
			}

			record = store.createRecord( "versioncheck", { id: 1, version } );
			await record.save();
		}

		set( this, "model", record );

		return existinguser;
	},

	async _showDebugMessage() {
		if ( !isDebug || isDevelopment ) { return; }

		const { model } = this;
		if ( Date.now() < model.showdebugmessage ) { return; }

		await this.modal.promiseModal( "debug", { buildVersion, displayName }, null, 1000 );
		set( model, "showdebugmessage", Date.now() + showDebugMessage );
		await model.save();
	},

	/**
	 * @param {boolean} existinguser
	 * @return {Promise}
	 */
	async _check( existinguser ) {
		if ( !existinguser ) {
			// show first run modal dialog
			this._openModalAndCheckForNewRelease( "firstrun" );
			return;
		}

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
