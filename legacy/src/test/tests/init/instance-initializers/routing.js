import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { visit, currentRouteName } from "@ember/test-helpers";
import sinon from "sinon";

import Controller from "@ember/controller";
import Route from "@ember/routing/route";
import Router from "@ember/routing/router";
import Service from "@ember/service";

import RoutingInstanceInitializer from "init/instance-initializers/routing";


module( "init/instance-initializers/routing", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map(function() {
			this.route( "foo" );
			this.route( "bar" );
			this.route( "baz", { path: "/baz/:a/:b/:c" } );
			this.route( "streams" );
			this.route( "channel", { path: "/channel/:id" } );
			this.route( "fail" );
		}),

		ApplicationRoute: class extends Route {},
		FooRoute: class extends Route {},
		BarRoute: class extends Route {},
		BazRoute: class extends Route {
			async model({ a, b, c }) {
				return { a, b, c };
			}
		},
		BazController: Controller.extend({
			queryParams: [
				{ foo: { type: "string" } }
			]
		}),
		StreamsRoute: class extends Route {},
		ChannelRoute: class extends Route {},
		ChannelController: class extends Controller {},
		FailRoute: class extends Route {},
		ErrorRoute: class extends Route {},
		LoadingRoute: class extends Route {}
	});

	setupApplicationTest( hooks );

	hooks.beforeEach(function() {
		this.openBrowserStub = sinon.stub().callsFake( async () => {} );

		this.owner.register( "service:nwjs", Service.extend({
			openBrowser: this.openBrowserStub
		}) );
		this.owner.register( "service:settings", Service.extend({
			content: {
				gui: {
					homepage: "/bar"
				}
			}
		}) );

		RoutingInstanceInitializer.initialize( this.owner );
	});


	test( "RoutingService#transitionTo with custom refresh logic", async function( assert ) {
		/** @type {RoutingService} */
		const RoutingService = this.owner.lookup( "service:-routing" );

		const refreshFooSpy = sinon.spy( this.owner.lookup( "route:foo" ), "refresh" );

		await visit( "/foo" );
		assert.strictEqual( currentRouteName(), "foo", "Current route is foo" );
		assert.notOk( refreshFooSpy.called, "Hasn't called refresh yet" );

		await RoutingService.transitionTo( "foo" );
		assert.ok( refreshFooSpy.calledOnce, "Refresh gets called on same-route transitions" );
		refreshFooSpy.resetHistory();

		const baz = RoutingService.transitionTo( "baz", [ "1", "2", "3" ], { foo: "bar" } );
		await baz;
		assert.strictEqual( currentRouteName(), "baz", "Current route is bar" );
		assert.notOk( refreshFooSpy.called, "Doesn't call refresh on regular transitions" );
		assert.strictEqual( baz.urlMethod, "update", "Doesn't set urlMethod to replace" );
		const { model, foo } = this.owner.lookup( "controller:baz" );
		assert.propEqual(
			model,
			{ a: "1", b: "2", c: "3" },
			"Correctly sets models on regular route transitions"
		);
		assert.strictEqual(
			foo,
			"bar",
			"Correctly sets queryParams on regular route transitions"
		);

		const bar = RoutingService.transitionTo( "bar", [], {}, true );
		await bar;
		assert.strictEqual( currentRouteName(), "bar", "Current route is bar" );
		assert.notOk( refreshFooSpy.called, "Doesn't call refresh on regular transitions" );
		assert.strictEqual( bar.urlMethod, "replace", "Sets urlMethod to replace" );
	});

	test( "RouterService#transitionTo with custom refresh logic", async function( assert ) {
		/** @type {RouterService} */
		const RouterService = this.owner.lookup( "service:router" );

		const refreshFooSpy = sinon.spy( this.owner.lookup( "route:foo" ), "refresh" );
		const refreshBazSpy = sinon.spy( this.owner.lookup( "route:baz" ), "refresh" );

		await visit( "/foo" );
		assert.strictEqual( currentRouteName(), "foo", "Current route is foo" );
		assert.notOk( refreshFooSpy.called, "Hasn't called refresh yet" );

		await RouterService.transitionTo( "/foo" );
		assert.ok( refreshFooSpy.calledOnce, "Refresh gets called on same-URL transitions" );
		refreshFooSpy.resetHistory();

		await RouterService.transitionTo( "foo" );
		assert.ok( refreshFooSpy.calledOnce, "Refresh gets called on same-route transitions" );
		refreshFooSpy.resetHistory();

		await RouterService.transitionTo( "/bar" );
		assert.notOk( refreshFooSpy.called, "Doesn't call refresh on regular URL transitions" );

		await RouterService.transitionTo( "baz", "1", "2", "3", { queryParams: { foo: "bar" } } );
		assert.notOk( refreshBazSpy.called, "Doesn't call refresh on regular route transitions" );
		const { model, foo } = this.owner.lookup( "controller:baz" );
		assert.propEqual(
			model,
			{ a: "1", b: "2", c: "3" },
			"Correctly extracts models on regular route transitions"
		);
		assert.strictEqual(
			foo,
			"bar",
			"Correctly extracts queryParams on regular route transitions"
		);
	});

	test( "RouterService#history", function( assert ) {
		assert.expect( 2 );

		/** @type {RouterService} */
		const RouterService = this.owner.lookup( "service:router" );
		const historyGoStub = sinon.stub( window.history, "go" );

		try {
			RouterService.history( -1 );
			assert.ok(
				historyGoStub.calledWithExactly( -1 ),
				"Goes back one entry in the history stack"
			);
			historyGoStub.resetHistory();

			RouterService.history( 1 );
			assert.ok(
				historyGoStub.calledWithExactly( 1 ),
				"Goes forward one entry in the history stack"
			);
		} catch ( e ) {}

		historyGoStub.resetBehavior();
	});

	test( "RouterService#homepage", async function( assert ) {
		/** @type {RouterService} */
		const RouterService = this.owner.lookup( "service:router" );

		await visit( "/foo" );
		assert.strictEqual( currentRouteName(), "foo", "Current route is foo" );

		const transitionOne = RouterService.homepage();
		await transitionOne;
		assert.strictEqual( currentRouteName(), "bar", "Transitioned to homepage /bar" );
		assert.strictEqual( transitionOne.urlMethod, "update", "Updates the URL" );

		await visit( "/foo" );
		assert.strictEqual( currentRouteName(), "foo", "Current route is foo" );

		const transitionTwo = RouterService.homepage( true );
		await transitionTwo;
		assert.strictEqual( currentRouteName(), "bar", "Transitioned to homepage /bar" );
		assert.strictEqual( transitionTwo.urlMethod, "replace", "Replaces the URL" );

		await visit( "/foo" );
		assert.strictEqual( currentRouteName(), "foo", "Current route is foo" );

		this.owner.lookup( "service:settings" ).content.gui.homepage = "";
		await RouterService.homepage();
		assert.strictEqual( currentRouteName(), "streams", "Transitioned to fallback homepage" );
	});

	test( "RouterService#openBrowserOrTransitionToChannel", async function( assert ) {
		/** @type {RouterService} */
		const RouterService = this.owner.lookup( "service:router" );

		await visit( "/foo" );
		assert.strictEqual( currentRouteName(), "foo", "Current route is foo" );

		await RouterService.openBrowserOrTransitionToChannel();
		assert.strictEqual( currentRouteName(), "foo", "Doesn't transition on empty URL" );
		assert.notOk( this.openBrowserStub.called, "Doesn't open browser on empty URL" );

		await RouterService.openBrowserOrTransitionToChannel( "https://www.twitch.tv/foo" );
		assert.strictEqual( currentRouteName(), "channel", "Transitions to channel route" );
		assert.propEqual(
			this.owner.lookup( "controller:channel" ).model,
			{ id: "foo" },
			"Sets the channel model"
		);
		assert.notOk( this.openBrowserStub.called, "Doesn't open browser on channel URL" );

		await visit( "/foo" );
		assert.strictEqual( currentRouteName(), "foo", "Current route is foo" );

		await RouterService.openBrowserOrTransitionToChannel( "https://foo.bar" );
		assert.strictEqual( currentRouteName(), "foo", "Doesn't transition on regular URL" );
		assert.ok(
			this.openBrowserStub.calledWithExactly( "https://foo.bar" ),
			"Opens browser on regular URL"
		);
	});

	test( "Refresh on error", async function( assert ) {
		/** @type {RouterService} */
		const RouterService = this.owner.lookup( "service:router" );
		/** @type {EmberRouter} */
		const router = this.owner.lookup( "router:main" );

		const error = new Error( "fail" );
		let attempts = 0;

		this.owner.lookup( "route:fail" ).reopen({
			async model() {
				if ( ++attempts < 3 ) {
					throw error;
				}
			}
		});

		await visit( "foo" );
		assert.strictEqual( currentRouteName(), "foo", "Current route is foo" );

		const transitionOne = RouterService.transitionTo( "fail" );
		const retryTransitionSpyOne = sinon.spy( transitionOne, "retry" );

		await transitionOne.promise;
		assert.notOk(
			transitionOne.routeInfos.every( info => info.isResolved ),
			"Transition failed"
		);
		assert.ok( transitionOne.isAborted, "Transition was aborted" );
		assert.strictEqual(
			router.errorTransition,
			transitionOne,
			"Router remembers the first errorTransition"
		);
		assert.strictEqual( currentRouteName(), "error", "Current route is the error route" );

		const transitionTwo = RouterService.refresh();
		const retryTransitionSpyTwo = sinon.spy( transitionTwo, "retry" );
		assert.ok( retryTransitionSpyOne.calledOnce, "Calls errorTransition.retry() on refresh" );

		await assert.rejects( transitionTwo.promise, error, "Rejects on first refresh" );
		assert.strictEqual(
			router.errorTransition,
			transitionTwo,
			"Router remembers the new errorTransition"
		);
		assert.strictEqual( currentRouteName(), "error", "Current route is still the error route" );

		await RouterService.refresh();
		assert.ok(
			retryTransitionSpyTwo.calledOnce,
			"Retries errored transition on second refresh"
		);
		assert.notOk( !!router.errorTransition, "Unsets errorTransition on second refresh" );
		assert.strictEqual( currentRouteName(), "fail", "Current route is the fail route" );
	});
});
