import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import sinon from "sinon";

import Service from "@ember/service";

import nwjsServiceInjector from "inject-loader?nwjs/App&nwjs/Shell&nwjs/Window!services/nwjs";
import {
	ATTR_GUI_INTEGRATION_TASKBAR,
	ATTR_GUI_INTEGRATION_TRAY,
	ATTR_GUI_INTEGRATION_BOTH
} from "data/models/settings/gui/fragment";


module( "services/nwjs", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			ModalService: Service.extend(),
			StreamingService: Service.extend()
		})
	});

	hooks.beforeEach(function() {
		this.quitSpy = sinon.spy();
		this.openBrowserSpy = sinon.spy();
		this.toggleVisibilitySpy = sinon.spy();
		this.toggleMinimizedSpy = sinon.spy();
		this.toggleMaximizedSpy = sinon.spy();
		this.toggleShowInTaskbarSpy = sinon.spy();

		const guiSettings = this.guiSettings = {
			integration: ATTR_GUI_INTEGRATION_BOTH,
			minimizetotray: false
		};

		this.owner.register( "service:settings", Service.extend({
			content: {
				gui: {
					get integration() {
						return guiSettings.integration;
					},
					get minimizetotray() {
						return guiSettings.minimizetotray;
					}
				}
			}
		}) );

		this.owner.register( "service:nwjs", nwjsServiceInjector({
			"nwjs/App": {
				quit: this.quitSpy
			},
			"nwjs/Shell": {
				openBrowser: this.openBrowserSpy
			},
			"nwjs/Window": {
				toggleVisibility: this.toggleVisibilitySpy,
				toggleMinimized: this.toggleMinimizedSpy,
				toggleMaximized: this.toggleMaximizedSpy,
				toggleShowInTaskbar: this.toggleShowInTaskbarSpy
			}
		}).default );
	});


	test( "Minimize", function( assert ) {
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
		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );

		NwjsService.maximize();
		assert.ok( this.toggleMaximizedSpy.calledOnce, "Calls toggleMaxmized" );
	});


	test( "Quit", function( assert ) {
		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );

		NwjsService.quit();
		assert.ok( this.quitSpy.calledOnce, "Calls quit" );
	});


	test( "OpenBrowser", function( assert ) {
		/** @type {NwjsService} */
		const NwjsService = this.owner.lookup( "service:nwjs" );

		const args = [ 1, 2, 3 ];
		NwjsService.openBrowser( ...args );
		assert.ok( this.openBrowserSpy.calledOnceWithExactly( ...args ), "Calls openBrowser" );
	});
});
