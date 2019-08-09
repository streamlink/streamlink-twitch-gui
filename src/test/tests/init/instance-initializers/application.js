import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import {
	stubDOMEvents,
	isDefaultPrevented,
	isImmediatePropagationStopped,
	triggerEvent,
	triggerKeyEvent
} from "event-utils";
import { visit } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import { set } from "@ember/object";
import Router from "@ember/routing/router";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import applicationInstanceInitializerInjector
	from "inject-loader?smoothscroll!init/instance-initializers/application";
import { themes as themesConfig } from "config";


module( "init/instance-initializers/application", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}),

		ApplicationTemplate: hbs`
			<div class="foo" />
			<input type="text" class="bar" />
			<textarea class="baz" />
		`,

		SettingsService: Service.extend({
			gui: {
				theme: "foo",
				smoothscroll: false
			}
		})
	});

	setupApplicationTest( hooks );
	stubDOMEvents( hooks );

	hooks.beforeEach(function( assert ) {
		this.hotkeyTriggerSpy = sinon.spy();
		this.routerHistorySpy = sinon.spy();
		this.smoothscrollEnableSpy = sinon.spy();
		this.smoothscrollDisableSpy = sinon.spy();

		this.owner.register( "service:hotkey", Service.extend({
			trigger: this.hotkeyTriggerSpy
		}) );
		this.owner.register( "service:router", Service.extend({
			history: this.routerHistorySpy
		}) );

		const { default: ApplicationInstanceInitializer } = applicationInstanceInitializerInjector({
			smoothscroll: {
				enable: this.smoothscrollEnableSpy,
				disable: this.smoothscrollDisableSpy
			}
		});

		assert.strictEqual(
			ApplicationInstanceInitializer.before,
			"nwjs",
			"Executes before nwjs instance initializer"
		);

		ApplicationInstanceInitializer.initialize( this.owner );
	});


	test( "Themes", async function( assert ) {
		await visit( "/" );

		const element = this.owner.lookup( "service:-document" ).documentElement;
		const settingsService = this.owner.lookup( "service:settings" );

		element.classList.add( "irrelevant-class" );
		assert.propEqual(
			Array.from( element.classList.values() ),
			[ "irrelevant-class" ],
			"No theme set initially"
		);

		run( () => set( settingsService, "gui.theme", "unknown" ) );
		assert.propEqual(
			Array.from( element.classList.values() ),
			[ "irrelevant-class", "theme-default" ],
			"Chooses the default theme for unknown themes"
		);

		for ( const theme of themesConfig.themes ) {
			run( () => set( settingsService, "gui.theme", theme ) );
			assert.propEqual(
				Array.from( element.classList.values() ),
				[ "irrelevant-class", `theme-${theme}` ],
				`Supports the ${theme} theme and properly sets and removes theme class names`
			);
		}

		element.classList.remove( "irrelevant-class" );
	});

	test( "Smoothscroll", async function( assert ) {
		await visit( "/" );

		const settingsService = this.owner.lookup( "service:settings" );
		set( settingsService, "gui.smoothscroll", true );
		assert.ok( this.smoothscrollEnableSpy.calledOnce, "Enables smooth scrolling" );
		assert.notOk( this.smoothscrollDisableSpy.called, "Doesn't disable smooth scrolling" );
		this.smoothscrollEnableSpy.resetHistory();

		set( settingsService, "gui.smoothscroll", false );
		assert.ok( this.smoothscrollDisableSpy.calledOnce, "Disables smooth scrolling" );
		assert.notOk( this.smoothscrollEnableSpy.called, "Doesn't enable smooth scrolling" );
	});

	test( "RouterService", async function( assert ) {
		await visit( "/" );

		let event;
		const rootElement = document.querySelector( this.owner.rootElement );

		// mouse button 1
		event = await triggerEvent( rootElement, "mouseup", { buttons: 0b00001 } );
		assert.notOk( this.routerHistorySpy.called, "Doesn't navigate history on left click" );
		assert.notOk( isDefaultPrevented( event ), "Doesn't prevent default action on left click" );
		assert.notOk(
			isImmediatePropagationStopped( event ),
			"Doesn't stop immediate event propagation on left click"
		);

		// mouse button 4
		event = await triggerEvent( rootElement, "mouseup", { buttons: 0b01000 } );
		assert.ok( this.routerHistorySpy.calledOnceWithExactly( -1 ), "History -1" );
		assert.ok( isDefaultPrevented( event ), "Prevents default action on mouse 4" );
		assert.ok(
			isImmediatePropagationStopped( event ),
			"Stops immediate event propagation on mouse 4"
		);
		this.routerHistorySpy.resetHistory();

		// mouse button 5
		event = await triggerEvent( rootElement, "mouseup", { buttons: 0b10000 } );
		assert.ok( this.routerHistorySpy.calledOnceWithExactly( +1 ), "History +1" );
		assert.ok( isDefaultPrevented( event ), "Prevents default action on mouse 5" );
		assert.ok(
			isImmediatePropagationStopped( event ),
			"Stops immediate event propagation on mouse 5"
		);
	});

	test( "HotkeyService", async function( assert ) {
		await visit( "/" );

		await triggerKeyEvent( ".foo", "keyup", "1" );
		assert.ok( this.hotkeyTriggerSpy.calledOnce, "Triggers hotkeys on regular elements" );
		this.hotkeyTriggerSpy.resetHistory();

		await triggerKeyEvent( ".bar", "keyup", "2" );
		assert.notOk( this.hotkeyTriggerSpy.called, "Doesn't trigger hotkeys on inputs" );

		await triggerKeyEvent( ".baz", "keyup", "3" );
		assert.notOk( this.hotkeyTriggerSpy.called, "Doesn't trigger hotkeys on textareas" );
	});

	test( "Drag & drop", async function( assert ) {
		await visit( "/" );

		const events = "dragstart dragover dragend dragenter dragleave dragexit drag drop";
		const rootElement = document.querySelector( this.owner.rootElement );

		for ( const name of events.split( " " ) ) {
			const event = await triggerEvent( rootElement, name );
			assert.ok( isDefaultPrevented( event ), `Prevents default action for event ${name}` );
			assert.ok(
				isImmediatePropagationStopped( event ),
				`Stops immediate event propagation for event ${name}`
			);
		}
	});
});
