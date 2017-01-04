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
	}
});


test( "Hours from now with interval", function( assert ) {

	const done = assert.async();

	owner.register( "helper:hours-from-now", HoursFromNowHelper );
	component = Component.extend({
		layout: compile( "{{hours-from-now date interval=40}}" )
	}).create();
	setOwner( component, owner );

	set( component, "date", +new Date() - 59 * 1000 - 950 );
	runAppend( component );
	assert.equal( getOutput( component ), "just now", "Initial content" );

	run.later(function() {
		run.scheduleOnce( "afterRender", function() {
			assert.equal( getOutput( component ), "01m", "Upgraded content" );
			done();
		});
	}, 100 );

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
