import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render, clearRender } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Moment from "moment";

import { helper as TimeFromNowHelper } from "ui/components/helper/time-from-now";


module( "ui/components/helper/time-from-now", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			TimeFromNowHelper
		})
	});

	hooks.before(function() {
		Moment.locale( "en" );
	});
	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date", "setTimeout", "clearTimeout" ],
			target: window
		});
	});
	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	test( "Unit test", async function( assert ) {
		const Helper = this.owner.factoryFor( "helper:time-from-now" );
		const helper = Helper.create();
		const time = new Date() - Math.PI * 60 * 1000;

		assert.strictEqual(
			helper.compute( [ time ], {} ),
			"3 minutes ago",
			"Time from now with suffix"
		);

		assert.strictEqual(
			helper.compute( [ time ], { suffix: true } ),
			"3 minutes",
			"Time from now without suffix"
		);
	});


	test( "Interval", async function( assert ) {
		this.set( "time", new Date() );
		await render( hbs`{{time-from-now time interval=60000}}` );

		assert.strictEqual(
			this.element.innerText,
			"a few seconds ago",
			"Initial content"
		);

		this.fakeTimer.tick( 59999 );
		assert.strictEqual(
			this.element.innerText,
			"a few seconds ago",
			"Interval not yet completed"
		);

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			this.element.innerText,
			"a minute ago",
			"Updated content"
		);

		await clearRender();
		this.fakeTimer.tick( 60000 );
	});

});
