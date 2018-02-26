import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import sinon from "sinon";

import HoursFromNowHelper from "helpers/HoursFromNowHelper";


moduleForComponent( "helpers/HoursFromNowHelper", {
	integration: true,
	resolver: buildResolver({
		HoursFromNowHelper
	}),
	beforeEach() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date", "setTimeout", "clearTimeout" ],
			target: window
		});
	},
	afterEach() {
		this.fakeTimer.restore();
	}
});


test( "Unit test", function( assert ) {

	const helper = HoursFromNowHelper.create();

	const time = new Date();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	function compute() {
		return helper.compute( [ time ], {} );
	}

	assert.strictEqual( compute(), "just now", "Initial content" );

	this.fakeTimer.setSystemTime( minute - 1 );
	assert.strictEqual( compute(), "just now", "Almost a minute" );

	this.fakeTimer.tick( 1 );
	assert.strictEqual( compute(), "01m", "One minute" );

	this.fakeTimer.setSystemTime( 10 * minute - 1 );
	assert.strictEqual( compute(), "09m", "Almost ten minutes" );

	this.fakeTimer.tick( 1 );
	assert.strictEqual( compute(), "10m", "Ten minutes" );

	this.fakeTimer.setSystemTime( hour - 1 );
	assert.strictEqual( compute(), "59m", "Almost an hour" );

	this.fakeTimer.tick( 1 );
	assert.strictEqual( compute(), "1h", "One hour" );

	this.fakeTimer.setSystemTime( 10 * hour - 1 );
	assert.strictEqual( compute(), "9h59m", "Almost ten hours" );

	this.fakeTimer.tick( 1 );
	assert.strictEqual( compute(), "10h", "Ten hours" );

	this.fakeTimer.setSystemTime( day - 1 );
	assert.strictEqual( compute(), "23h59m", "Almost a day" );

	this.fakeTimer.tick( 1 );
	assert.strictEqual( compute(), "1d", "One day" );

});


test( "Interval", function( assert ) {

	this.set( "time", new Date() );
	this.render( hbs`{{hours-from-now time interval=60000}}` );

	assert.strictEqual( this.$().text(), "just now", "Initial content" );

	this.fakeTimer.tick( 59999 );
	assert.strictEqual( this.$().text(), "just now", "Interval not yet completed" );

	this.fakeTimer.tick( 1 );
	assert.strictEqual( this.$().text(), "01m", "Updated content" );

	this.clearRender();
	this.fakeTimer.tick( 60000 );

});
