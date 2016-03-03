define([
	"Ember",
	"components/list/ContentListComponent",
	"helpers/IsGteHelper",
	"helpers/HasOwnPropertyHelper"
], function(
	Ember,
	ContentListComponent,
	IsGteHelper,
	HasOwnPropertyHelper
) {

	var setOwner = Ember.setOwner;
	var run = Ember.run;
	var Component = Ember.Component;
	var ComponentLookup = Ember.ComponentLookup;
	var compile = Ember.HTMLBars.compile;
	var reWhiteSpace = /\s+/g;

	var owner, component;

	function runAppend( view ) {
		run( view, "appendTo", "#qunit-fixture" );
	}

	function runDestroy( destroyed ) {
		if ( destroyed ) {
			run( destroyed, "destroy" );
		}
	}

	function getOutput( component, stripWhiteSpace ) {
		var text = component.$().text();
		return stripWhiteSpace
			? text.replace( reWhiteSpace, "" )
			: text;
	}

	function buildOwner( properties ) {
		var Owner = Ember.Object.extend( Ember._RegistryProxyMixin, Ember._ContainerProxyMixin, {
			init: function() {
				this._super.apply( this, arguments );
				var registry = new Ember.Registry( this._registryOptions );
				this.__registry__  = registry;
				this.__container__ = registry.container({ owner: this });
			}
		});

		return Owner.create( properties || {} );
	}

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
