import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import {
	stubDOMEvents,
	isDefaultPrevented,
	isImmediatePropagationStopped,
	triggerEvent
} from "event-utils";
import { click, visit, currentRouteName } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Route from "@ember/routing/route";
import Router from "@ember/routing/router";
import { run } from "@ember/runloop";

import RoutingInstanceInitializer from "init/instance-initializers/routing";
import LinkToComponent from "ui/components/link/link-to/component";


module( "ui/components/link/link-to", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map(function() {
			this.route( "foo" );
			this.route( "bar" );
			this.route( "baz", function() {
				this.route( "qux" );
			});
		}),
		ApplicationRoute: class extends Route {},
		ApplicationTemplate: hbs`
			{{#link-to "foo"}}foo{{/link-to}}
			{{#link-to "bar"}}bar{{/link-to}}
			{{#link-to "baz"}}baz{{/link-to}}
			{{#link-to "baz.qux"}}qux{{/link-to}}
		`,
		FooRoute: class extends Route {},
		BarRoute: class extends Route {},
		BazRoute: class extends Route {},
		BazIndexRoute: class extends Route {},
		BazQuxRoute: class extends Route {},
		BazQuxIndexRoute: class extends Route {},
		ErrorRoute: class extends Route {},
		LinkToComponent
	});

	setupApplicationTest( hooks );
	stubDOMEvents( hooks );

	hooks.beforeEach(function() {
		RoutingInstanceInitializer.initialize( this.owner );
	});


	test( "Refresh on click if route is already active", async function( assert ) {
		/** @type {RouterService} */
		const RouterService = this.owner.lookup( "service:router" );
		const refreshSpy = sinon.spy( RouterService, "refresh" );

		await visit( "/" );
		const anchors = Array.from( this.element.querySelectorAll( "a" ) ).slice( 0, 2 );
		const [ foo, bar ] = anchors;

		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ false, false ],
			"Both anchors are inactive"
		);

		await visit( "/foo" );
		assert.strictEqual( currentRouteName(), "foo", "Current route is now foo" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ true, false ],
			"First anchor is now active"
		);

		await click( foo );
		assert.strictEqual( currentRouteName(), "foo", "Current route is still foo" );
		assert.ok( refreshSpy.calledOnce, "Calls refresh when clicking foo" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ true, false ],
			"First anchor is still active"
		);
		refreshSpy.resetHistory();

		await click( bar );
		assert.strictEqual( currentRouteName(), "bar", "Current route is now bar" );
		assert.notOk( refreshSpy.called, "Doesn't call refresh when clicking bar" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ false, true ],
			"Second anchor now active"
		);

		// let foo fail from now on
		this.owner.lookup( "route:foo" ).reopen({
			async model() {
				throw new Error( "fail" );
			}
		});
		await RouterService.transitionTo( "foo" );
		run( () => {} );
		assert.strictEqual( currentRouteName(), "error", "Current route is now error" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ false, false ],
			"Both anchors are inactive"
		);

		await click( foo );
		assert.strictEqual( currentRouteName(), "error", "Current route is still error" );
		assert.notOk( refreshSpy.called, "Doesn't call refresh if coming from the error route" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ false, false ],
			"Both anchors are still inactive"
		);
	});

	test( "Nested routes", async function( assert ) {
		/** @type {RouterService} */
		const RouterService = this.owner.lookup( "service:router" );
		const refreshSpy = sinon.spy( RouterService, "refresh" );

		await visit( "/baz" );
		const anchors = Array.from( this.element.querySelectorAll( "a" ) ).slice( 2 );
		const [ baz, qux ] = anchors;

		assert.strictEqual( currentRouteName(), "baz.index", "Current route is baz.index" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ true, false ],
			"Third anchor is active"
		);

		await click( baz );
		assert.strictEqual( currentRouteName(), "baz.index", "Current route is still baz.index" );
		assert.ok( refreshSpy.calledOnce, "Calls refresh when clicking baz" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ true, false ],
			"Third anchor is still active"
		);
		refreshSpy.resetHistory();

		await click( qux );
		assert.strictEqual( currentRouteName(), "baz.qux", "Current route is now baz.qux" );
		assert.notOk( refreshSpy.called, "Doesn't call refresh when clicking qux" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ true, true ],
			"Third and fourth anchors are now active"
		);

		await click( qux );
		assert.strictEqual( currentRouteName(), "baz.qux", "Current route is still baz.qux" );
		assert.ok( refreshSpy.calledOnce, "Calls refresh when clicking qux" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ true, true ],
			"Third and fourth anchors are still active"
		);
		refreshSpy.resetHistory();

		await click( baz );
		assert.strictEqual( currentRouteName(), "baz.index", "Current route is baz.index again" );
		assert.notOk( refreshSpy.called, "Doesn't call refresh when clicking baz" );
		assert.propEqual(
			anchors.map( a => a.classList.contains( "active" ) ),
			[ true, false ],
			"Only the third anchor is active"
		);
	});

	test( "Prevent new windows from being opened", async function( assert ) {
		let e;

		this.owner.lookup( "route:foo" ).reopen({
			async model() {
				throw new Error( "fail" );
			}
		});

		await visit( "/" );
		const foo = this.element.querySelector( "a:first-of-type" );

		e = await triggerEvent( foo, "click", { buttons: 1 } );
		assert.ok( isDefaultPrevented( e ), "Prevents default on left click" );
		assert.notOk( isImmediatePropagationStopped( e ), "Continues propagation on left click" );
		e = await triggerEvent( foo, "click", { buttons: 2 } );
		assert.ok( isDefaultPrevented( e ), "Prevents default on middle click" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops propagation on middle click" );
		e = await triggerEvent( foo, "click", { buttons: 4 } );
		assert.ok( isDefaultPrevented( e ), "Prevents default on right click" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops propagation on right click" );
		e = await triggerEvent( foo, "click", { shiftKey: true } );
		assert.ok( isDefaultPrevented( e ), "Prevents default on shiftKey" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops propagation on shiftKey" );
		e = await triggerEvent( foo, "click", { ctrlKey: true } );
		assert.ok( isDefaultPrevented( e ), "Prevents default on ctrlKey" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops propagation on ctrlKey" );
		e = await triggerEvent( foo, "click", { altKey: true } );
		assert.ok( isDefaultPrevented( e ), "Prevents default on altKey" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops propagation on altKey" );
		e = await triggerEvent( foo, "click", { metaKey: true } );
		assert.ok( isDefaultPrevented( e ), "Prevents default on metaKey" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops propagation on metaKey" );
	});
});
