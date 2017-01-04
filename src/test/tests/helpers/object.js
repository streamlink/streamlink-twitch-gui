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
import GetParamHelper from "helpers/GetParamHelper";
import HasOwnPropertyHelper from "helpers/HasOwnPropertyHelper";


const { compile } = HTMLBars;

let owner, component;


module( "helpers/object", {
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


test( "Get param", function( assert ) {

	owner.register( "helper:get-param", GetParamHelper );
	component = Component.extend({
		param : "baz",
		index : 0,
		layout: compile( "{{get-param 'foo' 'bar' param index=index}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "foo", "First parameter's value is foo" );
	run( component, "set", "index", 2 );
	assert.equal( getOutput( component ), "baz", "Bound parameter" );
	run( component, "set", "param", "qux" );
	assert.equal( getOutput( component ), "qux", "Changed bound parameter" );

});


test( "Has own property", function( assert ) {

	owner.register( "helper:has-own-property", HasOwnPropertyHelper );
	component = Component.extend({
		obj   : { foo: true },
		prop  : "foo",
		layout: compile( "{{has-own-property obj prop}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "true", "Does have its own property" );
	run( component, "set", "prop", "bar" );
	assert.equal( getOutput( component ), "false", "Property does not exist" );
	run( component, "set", "prop", "toString" );
	assert.equal( getOutput( component ), "false", "Prototype property" );

});
