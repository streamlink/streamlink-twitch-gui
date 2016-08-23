import {
	module,
	test
} from "QUnit";
import {
	runAppend,
	runDestroy,
	cleanOutput,
	buildOwner
} from "Testutils";
import {
	setOwner,
	HTMLBars,
	RSVP,
	run,
	Component
} from "Ember";
import ContentListComponent from "components/list/ContentListComponent";
import IsGteHelper from "helpers/IsGteHelper";
import HasOwnPropertyHelper from "helpers/HasOwnPropertyHelper";


const { compile } = HTMLBars;

let owner, component;


module( "ContentListComponent", {
	setup() {
		owner = buildOwner();
		owner.register( "component:content-list", ContentListComponent );
		owner.register( "component:infinite-scroll", Component.extend({}) );
		owner.register( "helper:is-gte", IsGteHelper );
		owner.register( "helper:has-own-property", HasOwnPropertyHelper );
	},

	teardown() {
		runDestroy( component );
		runDestroy( owner );
		owner = component = null;
	}
});


test( "Empty content", function( assert ) {

	var content = [];
	var layout = compile(
		"{{#content-list content=content as |i|}}{{i}}{{else}}empty{{/content-list}}"
	);
	component = Component.extend({ content, layout }).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( cleanOutput( component ), "empty", "Empty content" );

	run( content, "pushObject", 1 );
	assert.equal( cleanOutput( component ), "1", "Non empty content" );

});


test( "New items", function( assert ) {

	var content = [ 1, 2 ];
	var layout = compile(
		"{{#content-list content=content as |i n|}}{{n}}{{/content-list}}"
	);
	component = Component.extend({ content, layout }).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( cleanOutput( component ), "falsefalse", "Initial content" );

	run( content, "pushObjects", [ 3, 4 ] );
	assert.equal( cleanOutput( component ), "falsefalsetruetrue", "Unique items" );

});


test( "Duplicates", function( assert ) {

	var content = [ 1, 2 ];
	var layout = compile(
		"{{#content-list content=content as |i n d|}}{{d}}{{/content-list}}"
	);
	component = Component.extend({ content, layout }).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( cleanOutput( component ), "falsefalse", "Initial content" );

	run( content, "pushObjects", [ 2, 3 ] );
	assert.equal( cleanOutput( component ), "falsefalsetruefalse", "Duplicates" );

});


test( "Simple nested duplicates", function( assert ) {

	var done = assert.async();
	var content = [ { foo: 1 }, { foo: 2 } ];
	var layout = compile(
		"{{#content-list content=content compare='foo' as |i n d|}}{{d}}{{/content-list}}"
	);
	component = Component.extend({ content, layout }).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( cleanOutput( component ), "falsefalse", "Initial content" );

	run( content, "pushObjects", [ { foo: 2 }, { foo: 3 } ] );
	run.next(function() {
		assert.equal(
			cleanOutput( component ),
			"falsefalsetruefalse",
			"Added nested duplicates"
		);
		done();
	});

});


test( "Deferred nested duplicates", function( assert ) {

	var done = assert.async();
	var a = RSVP.defer();
	var b = RSVP.defer();

	a.resolve( 1 );
	var content = [ { foo: a.promise } ];
	var layout = compile(
		"{{#content-list content=content compare='foo' as |i n d|}}{{d}}{{/content-list}}"
	);
	component = Component.extend({ content, layout }).create();
	setOwner( component, owner );

	runAppend( component );
	assert.equal( cleanOutput( component ), "false", "Initial content" );

	run( content, "pushObjects", [ { foo: b.promise } ] );
	run.next(function() {
		assert.equal( cleanOutput( component ),
			"falsefalse",
			"Added unresolved nested duplicate"
		);

		b.resolve( 1 );
		run.next(function() {
			assert.equal( cleanOutput( component ),
				"falsetrue",
				"Resolved nested duplicate"
			);

			done();
		});
	});

});
