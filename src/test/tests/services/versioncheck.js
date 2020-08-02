import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService, FakeTHelper } from "i18n-utils";
import { setupStore } from "store-utils";
import { render, click, triggerEvent } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import { set } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";
import Adapter from "ember-data/adapter";

import versioncheckServiceInjector
	from "inject-loader?nwjs/App&nwjs/argv!services/versioncheck";
import Versioncheck from "data/models/versioncheck/model";
import GithubReleases from "data/models/github/releases/model";
import GithubReleasesAdapter from "data/models/github/releases/adapter";
import GithubReleasesSerializer from "data/models/github/releases/serializer";
import ModalService from "services/modal";
import ModalServiceComponent from "ui/components/modal/modal-service/component";
import ModalHeaderComponent from "ui/components/modal/modal-header/component";
import ModalBodyComponent from "ui/components/modal/modal-body/component";
import ModalFooterComponent from "ui/components/modal/modal-footer/component";
import ModalFirstrunComponent from "ui/components/modal/modal-firstrun/component";
import ModalChangelogComponent from "ui/components/modal/modal-changelog/component";
import ModalNewreleaseComponent from "ui/components/modal/modal-newrelease/component";
import FormButtonComponent from "ui/components/button/form-button/component";
import GithubReleasesFixtures from "fixtures/data/models/github/releases.json";


module( "services/versioncheck", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			Versioncheck,
			GithubReleases,
			GithubReleasesAdapter,
			GithubReleasesSerializer,
			ModalService,
			ModalServiceComponent,
			ModalHeaderComponent,
			ModalBodyComponent,
			ModalFooterComponent,
			ModalFirstrunComponent,
			ModalChangelogComponent,
			ModalNewreleaseComponent,
			FormButtonComponent,
			HotkeyService: Service.extend({
				register: new Function(),
				unregister: new Function()
			}),
			I18nService: FakeI18nService,
			THelper: FakeTHelper
		})
	});

	hooks.beforeEach(function() {
		const context = this;
		const ARG_VERSIONCHECK = "versioncheck";

		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date" ],
			target: window
		});

		setupStore( this.owner );

		this.argVersioncheck = true;
		this.openBrowserSpy = sinon.spy();
		this.transitionToSpy = sinon.spy();

		this.versioncheckFindRecordStub = sinon.stub();
		this.versioncheckCreateRecordStub = sinon.stub()
			.callsFake( async ( store, type ) => type );
		this.versioncheckUpdateRecordStub = sinon.stub();

		this.releasesAjaxResponse = null;
		this.releasesAjaxStub = sinon.stub()
			.callsFake( async () => this.releasesAjaxResponse );

		this.createFakeRecord = ( name, data ) => {
			/** @type {DS.Store} */
			const store = this.owner.lookup( "service:store" );
			const record = store.createRecord( name, data );
			record._internalModel.transitionTo( "loaded.saved" );

			return record;
		};

		const { default: VersioncheckService } = versioncheckServiceInjector({
			"nwjs/App": {
				manifest: {
					version: "1.0.0"
				}
			},
			"nwjs/argv": {
				ARG_VERSIONCHECK,
				argv: {
					get [ ARG_VERSIONCHECK ]() {
						return context.argVersioncheck;
					}
				}
			}
		});
		this.owner.register( "service:versioncheck", VersioncheckService );

		this.owner.register( "service:nwjs", Service.extend({
			openBrowser: context.openBrowserSpy
		}) );
		this.owner.register( "service:router", Service.extend({
			transitionTo: context.transitionToSpy
		}) );

		this.owner.register( "adapter:versioncheck", Adapter.extend({
			findRecord: context.versioncheckFindRecordStub,
			createRecord: context.versioncheckCreateRecordStub,
			updateRecord: context.versioncheckUpdateRecordStub
		}) );
		this.owner.register( "adapter:github-releases", GithubReleasesAdapter.extend({
			ajax: context.releasesAjaxStub
		}) );
	});

	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	test( "First run", async function( assert ) {
		/** @type {VersioncheckService} */
		const VersioncheckService = this.owner.lookup( "service:versioncheck" );
		VersioncheckService._checkForNewRelease = sinon.spy();
		this.versioncheckFindRecordStub.rejects();

		await render( hbs`{{modal-service}}` );
		await run( async () => await VersioncheckService.check() );

		const modal = this.element.querySelector( ".modal-firstrun-component" );

		assert.ok(
			this.versioncheckCreateRecordStub.calledOnce,
			"Creates and saves new versioncheck record"
		);
		assert.ok(
			VersioncheckService.model instanceof Versioncheck,
			"Has a model property on the VersioncheckService"
		);
		assert.propEqual(
			VersioncheckService.model.toJSON({ includeId: true }),
			{
				id: "1",
				version: "1.0.0",
				checkagain: 0
			}
		);
		assert.ok( modal, "Shows firstrun modal" );
		assert.notOk(
			VersioncheckService._checkForNewRelease.called,
			"Doesn't automatically check for new release when showing the firstrun modal"
		);

		// close modal and transition to settings route
		await click( modal.querySelector( ".form-button-component.btn-success" ) );

		assert.notOk( VersioncheckService.modal.isModalOpened, "Modal has been closed" );
		assert.ok(
			this.transitionToSpy.calledWithExactly( "settings" ),
			"Transitions to settings"
		);
		assert.ok(
			VersioncheckService._checkForNewRelease.calledOnce,
			"Checks for new release after closing the firstrun modal"
		);
	});

	test( "Existing user - same version", async function( assert ) {
		/** @type {VersioncheckService} */
		const VersioncheckService = this.owner.lookup( "service:versioncheck" );
		VersioncheckService._checkForNewRelease = sinon.spy();

		this.versioncheckFindRecordStub.resolves( this.createFakeRecord( "versioncheck", {
			id: "1",
			version: "1.0.0"
		}) );

		await render( hbs`{{modal-service}}` );
		await run( async () => await VersioncheckService.check() );

		assert.ok(
			VersioncheckService.model instanceof Versioncheck,
			"VersioncheckService has a model property"
		);
		assert.ok(
			VersioncheckService._checkForNewRelease.calledOnce,
			"Automatically checks for new version"
		);
		assert.notOk( VersioncheckService.modal.isModalOpened, "No modal has been opened" );
	});

	test( "Existing user - new version - versioncheck enabled", async function( assert ) {
		/** @type {VersioncheckService} */
		const VersioncheckService = this.owner.lookup( "service:versioncheck" );
		VersioncheckService._checkForNewRelease = sinon.spy();

		this.versioncheckFindRecordStub.resolves( this.createFakeRecord( "versioncheck", {
			id: "1",
			version: "0.0.1"
		}) );

		await render( hbs`{{modal-service}}` );
		await run( async () => await VersioncheckService.check() );

		assert.ok(
			VersioncheckService.model instanceof Versioncheck,
			"VersioncheckService has a model property"
		);
		assert.strictEqual(
			VersioncheckService.model.version,
			"1.0.0",
			"Model version has been updated"
		);
		assert.ok( this.versioncheckUpdateRecordStub.calledOnce, "Model was updated" );
		assert.ok(
			VersioncheckService._checkForNewRelease.calledOnce,
			"Automatically checks for new version"
		);
		assert.notOk( VersioncheckService.modal.isModalOpened, "No modal has been opened" );
	});

	test( "Existing user - new version - versioncheck disabled", async function( assert ) {
		/** @type {VersioncheckService} */
		const VersioncheckService = this.owner.lookup( "service:versioncheck" );
		VersioncheckService._checkForNewRelease = sinon.spy();

		this.versioncheckFindRecordStub.resolves( this.createFakeRecord( "versioncheck", {
			id: "1",
			version: "0.0.1"
		}) );
		this.argVersioncheck = false;

		await render( hbs`{{modal-service}}` );
		await run( async () => await VersioncheckService.check() );

		const modal = this.element.querySelector( ".modal-changelog-component" );

		assert.ok(
			VersioncheckService.model instanceof Versioncheck,
			"VersioncheckService has a model property"
		);
		assert.strictEqual(
			VersioncheckService.model.version,
			"1.0.0",
			"Model version has been updated"
		);
		assert.ok( this.versioncheckUpdateRecordStub.calledOnce, "Model was updated" );
		assert.notOk(
			VersioncheckService._checkForNewRelease.called,
			"Doesn't automatically check for new version"
		);
		assert.ok( modal, "Shows changelog modal" );
		assert.strictEqual(
			modal.querySelector( ".modal-header-component" ).textContent.trim(),
			"modal.changelog.header{\"version\":\"1.0.0\"}",
			"Changelog modal has new version in its header"
		);

		// close modal and open changelog in browser
		const btn = modal.querySelector( ".form-button-component.btn-success" );
		await click( btn );
		await triggerEvent( btn, "webkitAnimationEnd" );

		assert.notOk( VersioncheckService.modal.isModalOpened, "Modal has been closed" );
		assert.ok(
			this.openBrowserSpy.calledWithExactly(
				"https://github.com/streamlink/streamlink-twitch-gui/releases/tag/v{version}",
				{
					version: "1.0.0"
				}
			),
			"Opens changelog in browser"
		);
		assert.ok(
			VersioncheckService._checkForNewRelease.calledOnce,
			"Checks for new release after closing the changelog modal"
		);
	});

	test( "Check for new release - versioncheck disabled", async function( assert ) {
		/** @type {VersioncheckService} */
		const VersioncheckService = this.owner.lookup( "service:versioncheck" );
		this.argVersioncheck = false;

		await render( hbs`{{modal-service}}` );
		await run( async () => await VersioncheckService._checkForNewRelease() );

		assert.notOk( this.releasesAjaxStub.called, "Doesn't query github releases" );
		assert.notOk( VersioncheckService.release, "Service doesn't have a release property" );
		assert.notOk(
			this.element.querySelector( ".modal-newrelease-component" ),
			"Doesn't show newrelease modal"
		);
	});

	test( "Check for new release - threshold not reached", async function( assert ) {
		/** @type {VersioncheckService} */
		const VersioncheckService = this.owner.lookup( "service:versioncheck" );
		set( VersioncheckService, "model", this.createFakeRecord( "versioncheck", {
			id: "1",
			version: "1.0.0",
			checkagain: Date.now() + 1
		}) );

		await render( hbs`{{modal-service}}` );
		await run( async () => await VersioncheckService._checkForNewRelease() );

		assert.notOk( this.releasesAjaxStub.called, "Doesn't query github releases" );
		assert.notOk( VersioncheckService.release, "Service doesn't have a release property" );
		assert.notOk(
			this.element.querySelector( ".modal-newrelease-component" ),
			"Doesn't show newrelease modal"
		);
	});

	test( "Check for new release - no new release", async function( assert ) {
		/** @type {VersioncheckService} */
		const VersioncheckService = this.owner.lookup( "service:versioncheck" );
		set( VersioncheckService, "model", this.createFakeRecord( "versioncheck", {
			id: "1",
			version: "1.0.0",
			checkagain: Date.now()
		}) );

		const fixtures = GithubReleasesFixtures[ "latest-older" ];
		this.releasesAjaxResponse = fixtures.response;

		await render( hbs`{{modal-service}}` );
		await run( async () => await VersioncheckService._checkForNewRelease() );

		assert.ok(
			this.releasesAjaxStub.calledOnceWithExactly(
				fixtures.request.url,
				fixtures.request.method,
				{ data: fixtures.request.query }
			),
			"Queries github releases"
		);
		assert.ok(
			VersioncheckService.release instanceof GithubReleases,
			"Service has a release property"
		);
		assert.strictEqual(
			VersioncheckService.model.checkagain,
			Date.now() + 604800000,
			"Updates the checkagain versioncheck attribute"
		);
		assert.ok( this.versioncheckUpdateRecordStub.calledOnce, "Updates versioncheck record" );
		assert.notOk(
			this.element.querySelector( ".modal-newrelease-component" ),
			"Doesn't show newrelease modal"
		);
	});

	test( "Check for new release - new release", async function( assert ) {
		/** @type {VersioncheckService} */
		const VersioncheckService = this.owner.lookup( "service:versioncheck" );
		set( VersioncheckService, "model", this.createFakeRecord( "versioncheck", {
			id: "1",
			version: "1.0.0",
			checkagain: Date.now()
		}) );

		const fixtures = GithubReleasesFixtures[ "latest-newer" ];
		this.releasesAjaxResponse = fixtures.response;

		await render( hbs`{{modal-service}}` );
		await run( async () => await VersioncheckService._checkForNewRelease() );

		const modal = this.element.querySelector( ".modal-newrelease-component" );

		assert.ok(
			this.releasesAjaxStub.calledOnceWithExactly(
				fixtures.request.url,
				fixtures.request.method,
				{ data: fixtures.request.query }
			),
			"Queries github releases"
		);
		assert.ok(
			VersioncheckService.release instanceof GithubReleases,
			"Service has a release property"
		);
		assert.strictEqual(
			VersioncheckService.model.checkagain,
			Date.now(),
			"Doesn't update the checkagain versioncheck attribute yet"
		);
		assert.notOk(
			this.versioncheckUpdateRecordStub.called,
			"Doesn't update versioncheck record yet"
		);
		assert.ok( modal, "Shows newrelease modal" );
		assert.strictEqual(
			modal.querySelector( ".modal-header-component" ).textContent.trim(),
			"modal.newrelease.header{\"version\":\"1.0.0\"}",
			"Modal has the correct header text"
		);
		assert.strictEqual(
			modal.querySelector( ".modal-body-component" ).textContent.trim(),
			"modal.newrelease.body{\"version\":\"1337.0.0\"}",
			"Modal has the correct body text"
		);

		// close modal and open release page in browser
		const btn = modal.querySelector( ".form-button-component.btn-success" );
		await click( btn );
		await triggerEvent( btn, "webkitAnimationEnd" );

		assert.notOk( VersioncheckService.modal.isModalOpened, "Modal has been closed" );
		assert.ok(
			this.openBrowserSpy.calledWithExactly(
				"https://github.com/streamlink/streamlink-twitch-gui/releases/v1337.0.0"
			),
			"Opens release page in browser"
		);
		assert.strictEqual(
			VersioncheckService.model.checkagain,
			Date.now() + 604800000,
			"Updates the checkagain versioncheck attribute"
		);
		assert.ok( this.versioncheckUpdateRecordStub.calledOnce, "Updates versioncheck record" );
	});
});
