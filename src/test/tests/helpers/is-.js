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
	setOwner,
	HTMLBars,
	run,
	Component
} from "ember";
import IsEqualHelper from "helpers/IsEqualHelper";
import IsNullHelper from "helpers/IsNullHelper";
import IsGtHelper from "helpers/IsGtHelper";
import IsGteHelper from "helpers/IsGteHelper";


const { compile } = HTMLBars;

let owner, component;


module( "helpers/is-", {
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


test( "Is equal", function( assert ) {

	owner.register( "helper:is-equal", IsEqualHelper );
	component = Component.extend({
		valA  : "foo",
		valB  : "foo",
		valC  : "foo",
		layout: compile( "{{is-equal valA valB valC}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "true", "Equal values" );
	run( component, "set", "valC", "bar" );
	assert.equal( getOutput( component ), "false", "Unequal values" );

});


test( "Is null", function( assert ) {

	owner.register( "helper:is-null", IsNullHelper );
	component = Component.extend({
		valA  : null,
		valB  : null,
		valC  : null,
		layout: compile( "{{is-null valA valB valC}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "true", "All values are null" );
	run( component, "set", "valC", false );
	assert.equal( getOutput( component ), "false", "Some values are not null" );

});


test( "Is greater than", function( assert ) {

	owner.register( "helper:is-gt", IsGtHelper );
	component = Component.extend({
		valA  : 2,
		valB  : 1,
		layout: compile( "{{is-gt valA valB}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "true", "2 is greater than 1" );
	run( component, "set", "valA", 0 );
	assert.equal( getOutput( component ), "false", "0 is not greater than 1" );

});


test( "Is greater than or equal", function( assert ) {

	owner.register( "helper:is-gte", IsGteHelper );
	component = Component.extend({
		valA  : 2,
		valB  : 1,
		layout: compile( "{{is-gte valA valB}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "true", "2 is greater than or equal 1" );
	run( component, "set", "valA", 1 );
	assert.equal( getOutput( component ), "true", "1 is greater than or equal 1" );
	run( component, "set", "valA", 0 );
	assert.equal( getOutput( component ), "false", "0 is not greater than or equal 1" );

});
