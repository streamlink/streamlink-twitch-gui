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
	Component
} from "Ember";
import MathAddHelper from "helpers/MathAddHelper";
import MathSubHelper from "helpers/MathSubHelper";
import MathMulHelper from "helpers/MathMulHelper";
import MathDivHelper from "helpers/MathDivHelper";


const { compile } = HTMLBars;

let owner, component;


module( "helpers/math-", {
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


test( "Math add", function( assert ) {

	owner.register( "helper:math-add", MathAddHelper );
	component = Component.extend({
		valA  : 1,
		valB  : 2,
		layout: compile( "{{math-add valA valB}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), 3, "1 + 2 = 3" );

});


test( "Math sub", function( assert ) {

	owner.register( "helper:math-sub", MathSubHelper );
	component = Component.extend({
		valA  : 1,
		valB  : 2,
		layout: compile( "{{math-sub valA valB}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), -1, "1 - 2 = -1" );

});


test( "Math mul", function( assert ) {

	owner.register( "helper:math-mul", MathMulHelper );
	component = Component.extend({
		valA  : 7,
		valB  : 7,
		layout: compile( "{{math-mul valA valB}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), 49, "7 * 7 = 49" );

});


test( "Math div", function( assert ) {

	owner.register( "helper:math-div", MathDivHelper );
	component = Component.extend({
		valA  : 12,
		valB  : 3,
		layout: compile( "{{math-div valA valB}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), 4, "12 / 3 = 4" );

});
