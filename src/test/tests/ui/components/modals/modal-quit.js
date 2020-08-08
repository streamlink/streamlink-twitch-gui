import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService, FakeTHelper } from "i18n-utils";
import { setupKeyboardLayoutMap } from "keyboard-layout-map";
import { triggerEvent } from "event-utils";
import { render, click } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Component from "@ember/component";
import { set } from "@ember/object";
import Evented from "@ember/object/evented";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import nwjsServiceInjector from "inject-loader?nwjs/App&nwjs/Shell&nwjs/Window!services/nwjs";
import HotkeyService from "services/hotkey";
import ModalService from "services/modal";
import ModalServiceComponent from "ui/components/modal/modal-service/component";
import ModalHeaderComponent from "ui/components/modal/modal-header/component";
import ModalBodyComponent from "ui/components/modal/modal-body/component";
import ModalFooterComponent from "ui/components/modal/modal-footer/component";
import ModalQuitComponent from "ui/components/modal/modal-quit/component";
import FormButtonComponent from "ui/components/button/form-button/component";


module( "ui/components/modals/modal-quit", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			HotkeyService,
			SettingsService: Service.extend( Evented ),
			I18nService: FakeI18nService,
			THelper: FakeTHelper,
			ModalService,
			ModalServiceComponent,
			ModalHeaderComponent,
			ModalBodyComponent,
			ModalFooterComponent,
			ModalQuitComponent,
			FormButtonComponent,
			LoadingSpinnerComponent: Component.extend()
		})
	});

	setupKeyboardLayoutMap( hooks );

	hooks.beforeEach(function() {
		this.quitSpy = sinon.spy();
		this.killAllSpy = sinon.spy();

		this.owner.register( "service:streaming", Service.extend({
			hasStreams: false,
			killAll: this.killAllSpy
		}) );

		this.owner.register( "service:nwjs", nwjsServiceInjector({
			"nwjs/App": {
				quit: this.quitSpy
			},
			"nwjs/nwGui": {},
			"nwjs/Window": {}
		}).default );
	});


	test( "Quit", async function( assert ) {
		/** @type {HotkeyService} */
		const hotkeyService = this.owner.lookup( "service:hotkey" );
		/** @type {ModalService} */
		const modalService = this.owner.lookup( "service:modal" );
		/** @type {NwjsService} */
		const nwjsService = this.owner.lookup( "service:nwjs" );
		/** @type {StreamingService} */
		const streamingService = this.owner.lookup( "service:streaming" );

		await render( hbs`{{modal-service}}` );
		this.element.addEventListener( "keydown", e => hotkeyService.trigger( e ) );

		run( () => nwjsService.close() );

		assert.notOk( modalService.hasModal( "quit" ), "Doesn't show modal quit dialog" );
		assert.ok( this.quitSpy.calledOnce, "Calls quit" );
		this.quitSpy.resetHistory();

		run( () => set( streamingService, "hasStreams", true ) );
		run( () => nwjsService.close() );

		const modal = this.element.querySelector( ".modal-quit-component" );
		assert.ok( modalService.hasModal( "quit" ), "Shows quit dialog if streams are opened" );
		assert.ok( modal instanceof HTMLElement, "Renders modal" );
		assert.strictEqual(
			modal.querySelector( ".modal-header-component" ).textContent.trim(),
			"modal.quit.header",
			"Modal header has the correct text if streams are still opened"
		);
		assert.strictEqual(
			modal.querySelector( ".modal-body-component" ).textContent.trim(),
			"modal.quit.body.streams",
			"Modal body has the correct text if streams are still opened"
		);
		assert.propEqual(
			Array.from( modal.querySelectorAll( ".modal-footer-component>.form-button-component" ) )
				.map( button => button.textContent.trim() ),
			[
				"modal.quit.action.close",
				"modal.quit.action.shutdown",
				"modal.quit.action.quit"
			],
			"Shows the correct buttons if streams are still opened"
		);
		assert.notOk( this.killAllSpy.called, "Hasn't called killAll yet" );
		assert.notOk( this.quitSpy.called, "Hasn't called quit yet" );

		await click( modal.querySelector( ".form-button-component:nth-of-type(2)" ) );
		assert.ok( this.killAllSpy.calledOnce, "Calls killAll on shutdown" );
		assert.ok( this.quitSpy.calledOnce, "Calls quit on shutdown" );
		this.killAllSpy.resetHistory();
		this.quitSpy.resetHistory();

		await triggerEvent( this.element, "keydown", { code: "KeyQ", ctrlKey: true } );
		assert.ok( this.killAllSpy.calledOnce, "Calls killAll on shutdown hotkey" );
		assert.ok( this.quitSpy.calledOnce, "Calls quit on shutdown hotkey" );
		this.killAllSpy.resetHistory();
		this.quitSpy.resetHistory();

		await click( modal.querySelector( ".form-button-component:nth-of-type(3)" ) );
		assert.notOk( this.killAllSpy.called, "Doesn't call killAll on quit" );
		assert.ok( this.quitSpy.calledOnce, "Calls quit on quit" );
		this.quitSpy.resetHistory();

		run( () => set( streamingService, "hasStreams", false ) );
		assert.strictEqual(
			modal.querySelector( ".modal-body-component" ).textContent.trim(),
			"modal.quit.body.no-streams",
			"Updates body text once all streams have been closed"
		);
		assert.propEqual(
			Array.from( modal.querySelectorAll( ".modal-footer-component>.form-button-component" ) )
				.map( button => button.textContent.trim() ),
			[
				"modal.quit.action.close",
				"modal.quit.action.quit"
			],
			"Updates buttons once all streams have been closed"
		);

		await triggerEvent( this.element, "keydown", { code: "Escape" } );
		assert.notOk( modalService.hasModal( "quit" ), "Closes modal on close hotkey" );
		assert.notOk( this.killAllSpy.calledOnce, "Doesn't call killAll on close hotkey" );
		assert.notOk( this.quitSpy.called, "Doesn't call quit on close hotkey" );
	});
});
