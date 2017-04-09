import {
	module,
	test
} from "qunit";
import {
	runAppend,
	runDestroy,
	getOutput,
	buildOwner
} from "test-utils";
import {
	get,
	setOwner,
	HTMLBars,
	run,
	Component
} from "ember";
import FormatViewersHelper from "helpers/FormatViewersHelper";
import FormatTimeHelper from "helpers/FormatTimeHelper";


const { compile } = HTMLBars;

let owner, component;


module( "helpers/format-", {
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


test( "Format viewers", function( assert ) {

	owner.register( "helper:format-viewers", FormatViewersHelper );
	component = Component.extend({
		viewers: "",
		layout : compile( "{{format-viewers viewers}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "0", "Unexpected values" );
	run( component, "set", "viewers", "foo" );
	assert.equal( getOutput( component ), "0", "Unexpected values" );

	run( component, "set", "viewers", 9 );
	assert.equal( getOutput( component ), "9", "Less than 5 digits" );
	run( component, "set", "viewers", 99 );
	assert.equal( getOutput( component ), "99", "Less than 5 digits" );
	run( component, "set", "viewers", 999 );
	assert.equal( getOutput( component ), "999", "Less than 5 digits" );
	run( component, "set", "viewers", 9999 );
	assert.equal( getOutput( component ), "9999", "Less than 5 digits" );

	run( component, "set", "viewers", 10000 );
	assert.equal( getOutput( component ), "10.0k", "Thousands" );
	run( component, "set", "viewers", 10099 );
	assert.equal( getOutput( component ), "10.0k", "Thousands" );
	run( component, "set", "viewers", 10100 );
	assert.equal( getOutput( component ), "10.1k", "Thousands" );
	run( component, "set", "viewers", 99999 );
	assert.equal( getOutput( component ), "99.9k", "Thousands" );
	run( component, "set", "viewers", 100000 );
	assert.equal( getOutput( component ), "100k", "Thousands" );
	run( component, "set", "viewers", 999999 );
	assert.equal( getOutput( component ), "999k", "Thousands" );

	run( component, "set", "viewers", 1000000 );
	assert.equal( getOutput( component ), "1.00m", "Millions" );
	run( component, "set", "viewers", 1009999 );
	assert.equal( getOutput( component ), "1.00m", "Millions" );
	run( component, "set", "viewers", 1010000 );
	assert.equal( getOutput( component ), "1.01m", "Millions" );

});


test( "Format time", function( assert ) {

	owner.register( "helper:format-time", FormatTimeHelper );
	component = Component.extend({
		time  : new Date(),
		format: "D",
		layout: compile( "{{format-time time format=format}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal(
		getOutput( component ),
		get( component, "time" ).getDate(),
		"Format time using a custom format"
	);

});
