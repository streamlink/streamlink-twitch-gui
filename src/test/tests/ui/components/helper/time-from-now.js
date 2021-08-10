import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeIntlService } from "intl-utils";
import { render, clearRender } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import { helper as TimeFromNowHelper } from "ui/components/helper/time-from-now";


module( "ui/components/helper/time-from-now", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			TimeFromNowHelper,
			IntlService: FakeIntlService
		})
	});

	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date", "setTimeout", "clearTimeout" ],
			global: window
		});
	});
	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});

	const second = 1000 * -1;
	const minute = second * 60;
	const hour = minute * 60;
	const day = hour * 24;
	const month = day * 30;
	const year = day * 365;


	test( "Unit test - numeric=auto (default)", async function( assert ) {
		const Helper = this.owner.factoryFor( "helper:time-from-now" );
		const helper = Helper.create();

		const fixtures = [
			[
				0,
				"this minute",
				"Now"
			], [
				minute / 2 + 1,
				"this minute",
				"Less than 30 seconds ago"
			], [
				minute / 2,
				"this minute",
				"Exactly 30 seconds ago"
			], [
				minute / 2 - 1,
				"1 minute ago",
				"More than 30 seconds ago"
			], [
				minute + 1,
				"1 minute ago",
				"Less than one minute ago"
			], [
				minute,
				"1 minute ago",
				"Exactly one minute ago"
			], [
				hour + 1,
				"60 minutes ago",
				"Less than one hour ago"
			], [
				hour,
				"1 hour ago",
				"Exactly one hour ago"
			], [
				day + 1,
				"24 hours ago",
				"Less than one day ago"
			], [
				day,
				"yesterday",
				"Exactly one day ago"
			], [
				day * 1.5,
				"yesterday",
				"Still yesterday"
			], [
				day * 1.5 - 1,
				"2 days ago",
				"Not yesterday anymore"
			], [
				month + 1,
				"30 days ago",
				"Less than one month ago"
			], [
				month,
				"last month",
				"Exactly one month ago"
			], [
				month * 1.5,
				"last month",
				"Still last month"
			], [
				month * 1.5 - 1,
				"2 months ago",
				"Not last month anymore"
			], [
				year + 1,
				"12 months ago",
				"Less than one year ago"
			], [
				year,
				"last year",
				"Exactly one year ago"
			], [
				year * 1.5,
				"last year",
				"Still last year"
			], [
				year * 1.5 - 1,
				"2 years ago",
				"Not last year anymore"
			]
		];

		for ( const [ offset, expected, description ] of fixtures ) {
			assert.strictEqual(
				helper.compute( [ new Date().getTime() + offset ], {} ),
				expected,
				description
			);
		}
	});

	test( "Unit test - numeric=always", function( assert ) {
		const Helper = this.owner.factoryFor( "helper:time-from-now" );
		const helper = Helper.create();

		const fixtures = [
			[
				0,
				"0 minutes ago",
				"Now"
			], [
				minute / 2 + 1,
				"0 minutes ago",
				"Less than 30 seconds ago"
			], [
				minute / 2,
				"0 minutes ago",
				"Exactly 30 seconds ago"
			], [
				minute / 2 - 1,
				"1 minute ago",
				"More than 30 seconds ago"
			], [
				minute + 1,
				"1 minute ago",
				"Less than one minute ago"
			], [
				minute,
				"1 minute ago",
				"Exactly one minute ago"
			], [
				hour + 1,
				"60 minutes ago",
				"Less than one hour ago"
			], [
				hour,
				"1 hour ago",
				"Exactly one hour ago"
			], [
				day + 1,
				"24 hours ago",
				"Less than one day ago"
			], [
				day,
				"1 day ago",
				"Exactly one day ago"
			], [
				day * 1.5,
				"1 day ago",
				"Still yesterday"
			], [
				day * 1.5 - 1,
				"2 days ago",
				"Not yesterday anymore"
			], [
				month + 1,
				"30 days ago",
				"Less than one month ago"
			], [
				month,
				"1 month ago",
				"Exactly one month ago"
			], [
				month * 1.5,
				"1 month ago",
				"Still last month"
			], [
				month * 1.5 - 1,
				"2 months ago",
				"Not last month anymore"
			], [
				year + 1,
				"12 months ago",
				"Less than one year ago"
			], [
				year,
				"1 year ago",
				"Exactly one year ago"
			], [
				year * 1.5,
				"1 year ago",
				"Still last year"
			], [
				year * 1.5 - 1,
				"2 years ago",
				"Not last year anymore"
			]
		];

		for ( const [ offset, expected, description ] of fixtures ) {
			assert.strictEqual(
				helper.compute( [ new Date().getTime() + offset ], { numeric: "always" } ),
				expected,
				description
			);
		}
	});

	test( "Interval", async function( assert ) {
		this.set( "time", new Date() );
		await render( hbs`{{time-from-now time interval=60000}}` );

		assert.strictEqual(
			this.element.innerText,
			"this minute",
			"Initial content"
		);

		this.fakeTimer.tick( 59999 );
		assert.strictEqual(
			this.element.innerText,
			"this minute",
			"Interval not yet completed"
		);

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			this.element.innerText,
			"1 minute ago",
			"Updated content"
		);

		this.fakeTimer.tick( 60000 );
		assert.strictEqual(
			this.element.innerText,
			"2 minutes ago",
			"Updated content again"
		);

		await clearRender();
		this.fakeTimer.tick( 60000 );
	});
});
