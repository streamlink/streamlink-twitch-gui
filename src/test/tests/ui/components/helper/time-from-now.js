import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import sinon from "sinon";

import { helper as TimeFromNowHelper } from "ui/components/helper/time-from-now";
import Moment from "moment";


moduleForComponent( "ui/components/helper/time-from-now", {
	integration: true,
	resolver: buildResolver({
		TimeFromNowHelper
	}),
	before() {
		Moment.locale( "en" );
	},
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

	const helper = TimeFromNowHelper.create();
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


test( "Interval", function( assert ) {

	this.set( "time", new Date() );
	this.render( hbs`{{time-from-now time interval=60000}}` );

	assert.strictEqual( this.$().text(), "a few seconds ago", "Initial content" );

	this.fakeTimer.tick( 59999 );
	assert.strictEqual( this.$().text(), "a few seconds ago", "Interval not yet completed" );

	this.fakeTimer.tick( 1 );
	assert.strictEqual( this.$().text(), "a minute ago", "Updated content" );

	this.clearRender();
	this.fakeTimer.tick( 60000 );

});

