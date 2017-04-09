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
import GetParamHelper from "helpers/GetParamHelper";
import GetIndexHelper from "helpers/GetIndexHelper";


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


test( "Get index", function( assert ) {

	owner.register( "helper:get-index", GetIndexHelper );
	component = Component.extend({
		arr   : [ 1, 2, 3 ],
		prop  : 1,
		layout: compile( "{{get-index arr prop}}{{get arr prop}}" )
	}).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( getOutput( component ), "2", "Gets the correcy value" );
	run( component, "set", "prop", 2 );
	assert.equal( getOutput( component ), "3", "Change index" );
	run( component, "set", "prop", 9999 );
	assert.equal( getOutput( component ), "", "Non-existing index" );

});
