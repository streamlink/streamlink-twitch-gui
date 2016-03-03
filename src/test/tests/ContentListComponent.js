define([
	"Testutils",
	"Ember",
	"components/list/ContentListComponent",
	"helpers/IsGteHelper",
	"helpers/HasOwnPropertyHelper"
], function(
	Testutils,
	Ember,
	ContentListComponent,
	IsGteHelper,
	HasOwnPropertyHelper
) {

	var runAppend  = Testutils.runAppend;
	var runDestroy = Testutils.runDestroy;
	var getOutput  = Testutils.getOutput;
	var buildOwner = Testutils.buildOwner;

	var setOwner = Ember.setOwner;
	var run = Ember.run;
	var Component = Ember.Component;
	var ComponentLookup = Ember.ComponentLookup;
	var compile = Ember.HTMLBars.compile;

	var owner, component;


	QUnit.module( "ContentListComponent", {
		"setup": function() {
			owner = buildOwner();
			owner.register( "component-lookup:main", ComponentLookup );
			owner.register( "component:content-list", ContentListComponent );
			owner.register( "component:infinite-scroll", Ember.Component.extend({}) );
			owner.register( "helper:is-gte", IsGteHelper );
			owner.register( "helper:has-own-property", HasOwnPropertyHelper );
		},

		"teardown": function() {
			runDestroy( component );
			runDestroy( owner );
			owner = component = null;
		}
	});


	QUnit.test( "Empty content", function( assert ) {

		var content = [];
		component = Component.extend({
			content: content,
			layout : compile(
				"{{#content-list content=content as |i|}}{{i}}{{else}}empty{{/content-list}}"
			)
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component, true ), "empty", "Empty content" );

		run( content, "pushObject", 1 );
		assert.equal( getOutput( component, true ), "1", "Non empty content" );

	});


	QUnit.test( "New items", function( assert ) {

		var content = [ 1, 2 ];
		component = Component.extend({
			content: content,
			layout : compile(
				"{{#content-list content=content as |i n|}}{{n}}{{/content-list}}"
			)
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component, true ), "falsefalse", "Initial content" );

		run( content, "pushObjects", [ 3, 4 ] );
		assert.equal( getOutput( component, true ), "falsefalsetruetrue", "Non empty content" );

	});


	QUnit.test( "Duplicates", function( assert ) {

		var content = [ 1, 2 ];
		component = Component.extend({
			content: content,
			layout : compile(
				"{{#content-list content=content as |i n d|}}{{d}}{{/content-list}}"
			)
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component, true ), "falsefalse", "Initial content" );

		run( content, "pushObjects", [ 2, 3 ] );
		assert.equal( getOutput( component, true ), "falsefalsetruefalse", "Non empty content" );

	});

});
