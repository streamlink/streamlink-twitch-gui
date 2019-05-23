import { module, test } from "qunit";
import { setupApplicationTest } from "ember-qunit";
import { buildFakeApplication } from "test-utils";
import { visit } from "@ember/test-helpers";
import sinon from "sinon";

import Route from "@ember/routing/route";
import Router from "@ember/routing/router";
import Service from "@ember/service";

import ApplicationRoute from "ui/routes/application/route";


module( "ui/routes/application", function( hooks ) {
	buildFakeApplication( hooks, {
		Router: Router.extend({
			location: "none"
		}).map(function() {
			this.route( "foo" );
		}),

		ApplicationRoute,
		IndexRoute: Route
	});

	setupApplicationTest( hooks );

	hooks.beforeEach(function() {
		const context = this;

		this.autoLoginSpy = sinon.spy();
		this.versionCheckSpy = sinon.spy();

		this.owner.register( "service:auth", class extends Service {
			autoLogin = context.autoLoginSpy;
		});
		this.owner.register( "service:versioncheck", class extends Service {
			check = context.versionCheckSpy;
		});
	});

	test( "Auto login and version check", async function( assert ) {
		await visit( "/" );
		assert.ok( this.autoLoginSpy.calledOnce, "Performs initial auto login" );
		assert.ok( this.versionCheckSpy.calledOnce, "Performs initial version check" );
	});
});
