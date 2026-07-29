import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { setupStore } from "store-utils";
import { visit, currentRouteName } from "@ember/test-helpers";
import sinon from "sinon";

import { set } from "@ember/object";
import Route from "@ember/routing/route";
import Router from "@ember/routing/router";
import Service from "@ember/service";
import Adapter from "ember-data/adapter";

import ChannelSettingsRoute from "ui/routes/channel/settings/route";
import ChannelSettings from "data/models/channel-settings/model";
import ObjectBuffer from "utils/ember/ObjectBuffer";


module( "ui/routes/channel/settings/route", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map(function() {
			this.route( "channel", function() {
				this.route( "settings" );
			});
		}),

		AuthService: Service.extend({
			session: {
				isLoggedIn: true
			}
		}),
		ModalService: Service.extend(),

		ChannelRoute: Route.extend({
			model: async () => ({
				user: {
					id: "foo"
				}
			})
		}),
		ChannelSettingsRoute,
		ChannelSettings
	});

	setupApplicationTest( hooks );

	hooks.beforeEach(function() {
		setupStore( this.owner );

		this.recordExists = true;
		this.owner.register( "adapter:channel-settings", Adapter.extend({
			findRecord: async () => this.recordExists
				? { id: "foo" }
				: Promise.reject()
		}) );
	});


	test( "Existing model", async function( assert ) {
		await visit( "channel/settings" );
		assert.strictEqual( currentRouteName(), "channel.settings", "Loads channel settings" );

		const controller = this.owner.lookup( "controller:channel.settings" );
		assert.propEqual(
			Object.keys( controller.model ),
			[ "model", "buffer" ],
			"Model object contains model and buffer"
		);
		assert.strictEqual( controller.model.model.id, "foo", "Has loaded the correct record" );
		assert.ok( controller.model.buffer instanceof ObjectBuffer, "Buffer is an ObjectBuffer" );
		assert.strictEqual(
			controller.model.model.currentState.stateName,
			"root.loaded.saved",
			"Existing record is in saved state"
		);

		await visit( "/" );
		assert.strictEqual( currentRouteName(), "index", "Current route is the index route" );
		assert.notOk(
			this.owner.lookup( "service:store" ).peekAll( "channel-settings" ).length,
			"Unloads all channel-settings records when leaving route"
		);

		await visit( "channel/settings" );
		assert.strictEqual( currentRouteName(), "channel.settings", "Loads channel settings" );
		assert.strictEqual( controller.model.model.id, "foo", "Has loaded the correct record" );
		assert.strictEqual(
			controller.model.model.currentState.stateName,
			"root.loaded.saved",
			"Existing record is in saved state"
		);
	});

	test( "Non-existing model", async function( assert ) {
		this.recordExists = false;

		await visit( "channel/settings" );
		assert.strictEqual( currentRouteName(), "channel.settings", "Loads channel settings" );

		const controller = this.owner.lookup( "controller:channel.settings" );
		assert.propEqual(
			Object.keys( controller.model ),
			[ "model", "buffer" ],
			"Model object contains model and buffer"
		);
		assert.strictEqual( controller.model.model.id, "foo", "Has loaded the correct record" );
		assert.ok( controller.model.buffer instanceof ObjectBuffer, "Buffer is an ObjectBuffer" );
		assert.strictEqual(
			controller.model.model.currentState.stateName,
			"root.loaded.created.uncommitted",
			"Newly created record is in uncommitted state"
		);

		await visit( "/" );
		assert.strictEqual( currentRouteName(), "index", "Current route is the index route" );
		assert.notOk(
			this.owner.lookup( "service:store" ).peekAll( "channel-settings" ).length,
			"Unloads all channel-settings records when leaving route"
		);

		await visit( "channel/settings" );
		assert.strictEqual( currentRouteName(), "channel.settings", "Loads channel settings" );
		assert.strictEqual( controller.model.model.id, "foo", "Has loaded the correct record" );
		assert.strictEqual(
			controller.model.model.currentState.stateName,
			"root.loaded.created.uncommitted",
			"Newly created record is in uncommitted state"
		);
	});

	test( "Refresh", async function( assert ) {
		await visit( "channel/settings" );

		const refreshSpy = sinon.spy();
		const parentRoute = this.owner.lookup( "route:channel" );
		parentRoute.refresh = refreshSpy;

		this.owner.lookup( "route:channel.settings" ).refresh();
		assert.ok( refreshSpy.calledOnce, "Refreshs parent route" );
	});

	test( "Confirm modal", async function( assert ) {
		const openModalSpy = sinon.spy();
		this.owner.lookup( "service:modal" ).openModal = openModalSpy;

		await visit( "channel/settings" );
		assert.strictEqual( currentRouteName(), "channel.settings", "Loads channel settings" );

		const controller = this.owner.lookup( "controller:channel.settings" );
		const buffer = controller.model.buffer;
		set( buffer, "foo", true );
		assert.ok( buffer.isDirty, "Buffer is dirty" );

		await assert.rejects( visit( "/" ), Error, "Aborts transition if dirty" );
		assert.strictEqual( currentRouteName(), "channel.settings", "Aborts transition if dirty" );
		assert.ok( openModalSpy.calledOnceWith( "confirm" ), "Opens confirm modal" );
		assert.ok(
			this.owner.lookup( "service:store" ).peekAll( "channel-settings" ).length,
			"Doesn't unload all channel-settings records when trying to leave route"
		);
	});
});
