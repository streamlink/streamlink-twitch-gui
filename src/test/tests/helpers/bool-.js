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
	setOwner,
	HTMLBars,
	run,
	Component
} from "Ember";
import BoolNotHelper from "helpers/BoolNotHelper";
import BoolAndHelper from "helpers/BoolAndHelper";
import BoolOrHelper from "helpers/BoolOrHelper";


const { compile } = HTMLBars;

let owner, component;


module( "helpers/bool-", {
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


test( "Bool not", function( assert ) {

	owner.register( "helper:bool-not", BoolNotHelper );
	component = Component.extend({
		valA  : false,
		valB  : null,
		valC  : undefined,
		valD  : "",
		layout: compile( "{{bool-not valA valB valC valD}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "true", "All values are falsey" );
	run( component, "set", "valA", true );
	assert.equal( getOutput( component ), "false", "Not all values are falsey" );

});


test( "Bool and", function( assert ) {

	owner.register( "helper:bool-and", BoolAndHelper );
	component = Component.extend({
		valA  : true,
		valB  : true,
		layout: compile( "{{bool-and valA valB}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "true", "A and B" );
	run( component, "set", "valA", false );
	assert.equal( getOutput( component ), "false", "not A and B" );

});


test( "Bool or", function( assert ) {

	owner.register( "helper:bool-or", BoolOrHelper );
	component = Component.extend({
		valA  : true,
		valB  : true,
		layout: compile( "{{bool-or valA valB}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "true", "A or B" );
	run( component, "set", "valA", false );
	assert.equal( getOutput( component ), "true", "A or B" );
	run( component, "set", "valB", false );
	assert.equal( getOutput( component ), "false", "not A or B" );

});
