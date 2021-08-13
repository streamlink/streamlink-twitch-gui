import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import sinon from "sinon";

import { A } from "@ember/array";
import EmberObject from "@ember/object";
import Service from "@ember/service";

import nwjsServiceInjector from "inject-loader?nwjs/App&nwjs/Shell&nwjs/Window!services/nwjs";
import {
	ATTR_GUI_INTEGRATION_TASKBAR,
	ATTR_GUI_INTEGRATION_TRAY,
	ATTR_GUI_INTEGRATION_BOTH
} from "data/models/settings/gui/fragment";


module( "services/nwjs", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver()
	});

	/** @typedef {TestContext} TestContextServicesNwjs */
	hooks.beforeEach( /** @this {TestContextServicesNwjs} */ function() {
		const self = this;

		this.quitSpy = sinon.spy();
		this.openExternalSpy = sinon.spy();
		this.toggleVisibilitySpy = sinon.spy();
		this.toggleMinimizedSpy = sinon.spy();
		this.toggleMaximizedSpy = sinon.spy();
		this.toggleShowInTaskbarSpy = sinon.spy();
		this.setFocusedSpy = sinon.spy();

		let clipboard;
		this.clipboardGetStub = sinon.stub().callsFake( () => clipboard );
		this.clipboardSetStub = sinon.stub().callsFake( data => clipboard = data );
		this.getClipboardStub = sinon.stub().returns({
			get: this.clipboardGetStub,
			set: this.clipboardSetStub
		});

		this.openModalSpy = sinon.spy();

		this.guiSettings = {
			integration: ATTR_GUI_INTEGRATION_BOTH,
			minimizetotray: false
		};

		this.owner.register( "service:modal", Service.extend({
			openModal: this.openModalSpy
		}) );

		this.owner.register( "service:settings", Service.extend({
			content: {
				gui: {
					get integration() {
						return self.guiSettings.integration;
					},
					get minimizetotray() {
						return self.guiSettings.minimizetotray;
					}
				}
			}
		}) );

		this.owner.register( "service:streaming", Service.extend({
			hasStreams: false
		}) );

		this.owner.register( "service:nwjs", nwjsServiceInjector({
			"nwjs/App": {
				quit: this.quitSpy
			},
			"nwjs/nwGui": {
				Clipboard: {
					get: this.getClipboardStub
				},
				Shell: {
					openExternal: this.openExternalSpy
				}
			},
			"nwjs/Window": {
				toggleVisibility: this.toggleVisibilitySpy,
				toggleMinimized: this.toggleMinimizedSpy,
				toggleMaximized: this.toggleMaximizedSpy,
				toggleShowInTaskbar: this.toggleShowInTaskbarSpy,
				setFocused: this.setFocusedSpy
			}
		}).default );
	});


	test( "Minimize", function( assert ) {
		/** @this {TestContextServicesNwjs} */
		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );

		NwjsService.minimize();
		assert.ok( this.toggleMinimizedSpy.calledOnce, "Minimizes if int==both && !tray" );
		assert.notOk( this.toggleVisibilitySpy.called, "Minimizes if int==both && !tray" );
		assert.notOk( this.toggleShowInTaskbarSpy.called, "Minimizes if int==both && !tray" );
		this.toggleMinimizedSpy.resetHistory();

		this.guiSettings.minimizetotray = true;
		NwjsService.minimize();
		assert.notOk( this.toggleMinimizedSpy.called, "Moves to tray if int==both && tray" );
		assert.ok( this.toggleVisibilitySpy.calledOnce, "Moves to tray if int==both && tray" );
		assert.ok( this.toggleShowInTaskbarSpy.calledOnce, "Moves to tray if int==both && tray" );
		this.toggleVisibilitySpy.resetHistory();
		this.toggleShowInTaskbarSpy.resetHistory();

		this.guiSettings.integration = ATTR_GUI_INTEGRATION_TASKBAR;
		NwjsService.minimize();
		assert.ok( this.toggleMinimizedSpy.calledOnce, "Minimizes if int==taskbar && tray" );
		assert.notOk( this.toggleVisibilitySpy.called, "Minimizes if int==taskbar && tray" );
		assert.notOk( this.toggleShowInTaskbarSpy.called, "Minimizes if int==taskbar && tray" );
		this.toggleMinimizedSpy.resetHistory();

		this.guiSettings.integration = ATTR_GUI_INTEGRATION_TRAY;
		NwjsService.minimize();
		assert.notOk( this.toggleMinimizedSpy.called, "Moves to tray if int==tray && tray" );
		assert.ok( this.toggleVisibilitySpy.calledOnce, "Moves to tray if int==tray && tray" );
		assert.ok( this.toggleShowInTaskbarSpy.calledOnce, "Moves to tray if int==tray && tray" );
		this.toggleVisibilitySpy.resetHistory();
		this.toggleShowInTaskbarSpy.resetHistory();

		this.guiSettings.minimizetotray = false;
		NwjsService.minimize();
		assert.notOk( this.toggleMinimizedSpy.called, "Moves to tray if int==tray && !tray" );
		assert.ok( this.toggleVisibilitySpy.calledOnce, "Moves to tray if int==tray && !tray" );
		assert.ok( this.toggleShowInTaskbarSpy.calledOnce, "Moves to tray if int==tray && !tray" );
		this.toggleVisibilitySpy.resetHistory();
		this.toggleShowInTaskbarSpy.resetHistory();
	});


	test( "Maximize", function( assert ) {
		/** @this {TestContextServicesNwjs} */
		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );

		NwjsService.maximize();
		assert.ok( this.toggleMaximizedSpy.calledOnce, "Calls toggleMaxmized" );
	});


	test( "Focus", function( assert ) {
		/** @this {TestContextServicesNwjs} */
		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );

		NwjsService.focus();
		assert.ok( this.setFocusedSpy.calledOnceWithExactly( true ), "Focuses window" );
		this.setFocusedSpy.resetHistory();
		NwjsService.focus( false );
		assert.ok( this.setFocusedSpy.calledOnceWithExactly( false ), "Unfocuses window" );
	});


	test( "Close", function( assert ) {
		/** @this {TestContextServicesNwjs} */
		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );

		NwjsService.close();
		assert.notOk( this.openModalSpy.called, "Doesn't open quit modal" );
		assert.ok( this.quitSpy.calledOnce, "Calls quit" );
		this.quitSpy.resetHistory();

		NwjsService.streaming.hasStreams = true;
		NwjsService.close();
		assert.ok( this.openModalSpy.calledOnceWith( "quit", {} ), "Opens quit modal" );
		assert.notOk( this.quitSpy.called, "Doesn't call quit" );

		NwjsService.close();
		assert.ok( this.openModalSpy.calledTwice );
		assert.strictEqual(
			this.openModalSpy.getCall( 0 ).lastArg,
			this.openModalSpy.getCall( 1 ).lastArg,
			"Shares the same modal quit context"
		);
		assert.notOk( this.quitSpy.called, "Doesn't call quit" );
	});


	test( "OpenBrowser", function( assert ) {
		/** @this {TestContextServicesNwjs} */
		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );

		assert.throws(
			() => NwjsService.openBrowser(),
			new Error( "Missing URL" ),
			"Throws if url is missing"
		);
		assert.notOk( this.openExternalSpy.called, "Doesn't open browser on error" );

		NwjsService.openBrowser( "https://foo.bar/" );
		assert.ok(
			this.openExternalSpy.calledOnceWithExactly( "https://foo.bar/" ),
			"Opens browser with simple URL"
		);
		this.openExternalSpy.resetHistory();

		assert.throws(
			() => NwjsService.openBrowser( "https://foo.bar/{foo}" ),
			new Error( "Missing value for key 'foo'" ),
			"Throws if variables are not defined"
		);
		assert.notOk( this.openExternalSpy.called, "Doesn't open browser on error" );

		assert.throws(
			() => NwjsService.openBrowser( "https://foo.bar/{foo}", { bar: "bar" } ),
			new Error( "Missing value for key 'foo'" ),
			"Throws if variable is missing"
		);
		assert.notOk( this.openExternalSpy.called, "Doesn't open browser on error" );

		NwjsService.openBrowser( "https://foo.bar/{foo}/{bar}", { foo: "foo", bar: "bar" } );
		assert.ok(
			this.openExternalSpy.calledOnceWithExactly( "https://foo.bar/foo/bar" ),
			"Opens browser with substituted URL"
		);
	});


	test( "Clipboard", function( assert ) {
		/** @this {TestContextServicesNwjs} */
		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );

		assert.notOk(
			this.getClipboardStub.called,
			"Doesn't initialize clipboard without property access"
		);

		NwjsService.clipboard.set( "foo" );
		assert.ok( this.getClipboardStub.called, "Initializes clipboard on first property access" );
		assert.ok( this.clipboardSetStub.called, "clipboard.set was called" );

		assert.strictEqual( NwjsService.clipboard.get(), "foo", "Gets correct clipboard value" );
		assert.ok( this.clipboardGetStub.called, "clipboard.get was called" );
	});

	test( "Context menu", function( assert ) {
		/** @this {TestContextServicesNwjs} */

		const menuPopupSpy = sinon.spy();
		this.owner.register( "nwjs:menu", EmberObject.extend({
			items: A(),
			menu: {
				popup: menuPopupSpy
			}
		}) );

		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );
		const menu = this.owner.lookup( "nwjs:menu" );

		// don't use a real MouseEvent here, because
		// it'll round the coords automatically in the constructor
		const event = {
			preventDefault: sinon.spy(),
			stopImmediatePropagation: sinon.spy(),
			clientX: 123.123,
			clientY: 987.987
		};
		const items = [
			{ label: "foo" },
			{ label: "bar" }
		];

		assert.notOk( menuPopupSpy.called, "Hasn't called menu.popup yet" );

		NwjsService.contextMenu( event, items );
		assert.ok( event.preventDefault.calledOnce, "Prevents default" );
		assert.ok( event.stopImmediatePropagation.calledOnce, "Stops immediate propagation" );
		assert.propEqual( menuPopupSpy.args, [ [ 123, 988 ] ], "It rounds click coordinates" );
		assert.propEqual( menu.items, items, "Sets the correct items" );
	});
});
