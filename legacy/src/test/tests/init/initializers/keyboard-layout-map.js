import { module, test } from "qunit";
import {
	getApplication,
	setupContext,
	teardownContext,
	setupApplicationContext,
	teardownApplicationContext
} from "@ember/test-helpers";
import { buildFakeApplication } from "test-utils";
import sinon from "sinon";

import KeyboardLayoutMapInitializer from "init/initializers/keyboard-layout-map";


module( "init/initializers/keyboard-layout-map", function( hooks ) {
	buildFakeApplication( hooks, { each: true }, {} );

	hooks.before(function() {
		this.getLayoutMapStub = sinon.stub( navigator.keyboard, "getLayoutMap" );
	});

	hooks.after(function() {
		this.getLayoutMapStub.restore();
	});

	hooks.beforeEach(function() {
		const application = getApplication();
		application.initializer( KeyboardLayoutMapInitializer );
	});

	hooks.afterEach(async function() {
		await teardownApplicationContext( this );
		await teardownContext( this );
	});


	test( "Initializer - success", async function( assert ) {
		class Subject extends Map {}
		this.getLayoutMapStub.callsFake( async () => new Subject() );

		await setupContext( this );
		await setupApplicationContext( this );

		const keyboardLayoutMap = this.owner.lookup( "keyboardlayoutmap:main" );
		assert.ok( keyboardLayoutMap instanceof Subject, "Registers the keyboard layout map" );
	});

	test( "Initializer - failure", async function( assert ) {
		this.getLayoutMapStub.rejects();

		await setupContext( this );
		await setupApplicationContext( this );

		const keyboardLayoutMap = this.owner.lookup( "keyboardlayoutmap:main" );
		assert.ok( keyboardLayoutMap instanceof Map, "Registers the empty fallback map" );
	});
});
