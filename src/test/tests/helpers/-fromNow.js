import {
	module,
	test
} from "QUnit";
import {
	runAppend,
	runDestroy,
	getOutput,
	buildOwner
} from "Testutils";
import {
	set,
	setOwner,
	HTMLBars,
	run,
	Component
} from "Ember";
import HoursFromNowHelper from "helpers/HoursFromNowHelper";
import TimeFromNowHelper from "helpers/TimeFromNowHelper";


const { now } = Date;
const { compile } = HTMLBars;

let owner, component;


module( "helpers/-fromNow", {
	beforeEach() {
		owner = buildOwner();
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( component );
		runDestroy( owner );
		owner = component = null;

		Date.now = now;
	}
});


test( "Hours from now with interval", function( assert ) {

	assert.expect( 3 );
	const done = assert.async();

	owner.register( "helper:hours-from-now", HoursFromNowHelper );
	component = Component.extend({
		layout: compile( "{{hours-from-now date interval=1}}" )
	}).create();
	setOwner( component, owner );

	Date.now = () => 0;

	set( component, "date", Date.now() );
	runAppend( component );
	assert.equal( getOutput( component ), "just now", "Initial content" );

	Date.now = () => 60 * 1000 - 1;
	run.later( 2, function() {
		assert.equal( getOutput( component ), "just now", "Almost a minute" );

		Date.now = () => 60 * 1000;
		run.later( 2, function() {
			assert.equal( getOutput( component ), "01m", "After a minute" );
			done();
		});
	});

});


test( "Time from now", function( assert ) {

	owner.register( "helper:time-from-now", TimeFromNowHelper );
	component = Component.extend({
		time  : new Date() - Math.PI * 60 * 1000,
		suffix: false,
		layout: compile( "{{time-from-now time suffix=suffix}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "3 minutes ago", "Time from now with suffix" );
	run( component, "set", "suffix", true );
	assert.equal( getOutput( component ), "3 minutes", "Time from now without suffix" );

});
