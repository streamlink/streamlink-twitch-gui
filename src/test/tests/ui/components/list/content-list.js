import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, cleanOutput, hbs } from "test-utils";
import { A as EmberNativeArray } from "@ember/array";
import Component from "@ember/component";
import { run, scheduleOnce } from "@ember/runloop";

import ContentListComponent from "ui/components/list/content-list/component";
import { helper as GetIndexHelper } from "ui/components/helper/get-index";
import { helper as IsGteHelper } from "ui/components/helper/is-gte";


moduleForComponent( "ui/components/list/content-list", {
	integration: true,
	resolver: buildResolver({
		ContentListComponent,
		GetIndexHelper,
		IsGteHelper
	}),
	beforeEach() {
		this.registry.register( "component:infinite-scroll", Component.extend() );
	}
});


test( "Empty content", function( assert ) {

	const content = new EmberNativeArray();

	this.set( "content", content );
	this.render( hbs`
		{{#content-list content as |item|}}
			{{item}}
		{{else}}
			empty
		{{/content-list}}
	` );

	assert.strictEqual( cleanOutput( this ), "empty", "Empty content" );

	run( () => content.pushObject( 1 ) );
	assert.equal( cleanOutput( this ), "1", "Non empty content" );

});


test( "New items", function( assert ) {

	const content = new EmberNativeArray([ 1, 2 ]);

	this.set( "content", content );
	this.render( hbs`
		{{#content-list content as |item new|}}
			{{if new "Y" "N"}}
		{{/content-list}}
	` );

	assert.strictEqual( cleanOutput( this ), "NN", "Initial content" );

	run( () => content.pushObjects([ 3, 4 ]) );
	assert.strictEqual( cleanOutput( this ), "NNYY", "Unique items" );

});


test( "Duplicates", function( assert ) {

	const content = new EmberNativeArray([ 1, 2 ]);

	this.set( "content", content );
	this.render( hbs`
		{{#content-list content as |item new dup|}}
			{{if dup "Y" "N"}}
		{{/content-list}}
	` );

	assert.strictEqual( cleanOutput( this ), "NN", "Initial content" );

	run( () => content.pushObjects([ 2, 3 ]) );
	assert.strictEqual( cleanOutput( this ), "NNYN", "2 is a duplicate" );

	run( () => content.pushObjects([ 1, 2, 3 ]) );
	assert.strictEqual( cleanOutput( this ), "NNYNYYY", "1, 2 and 3 are duplicates" );

});


test( "Simple nested duplicates", function( assert ) {

	const content = new EmberNativeArray([ { data: 1 }, { data: 2 } ]);

	this.set( "content", content );
	this.render( hbs`
		{{#content-list content "data" as |item new dup|}}
			{{if dup "Y" "N"}}
		{{/content-list}}
	` );

	assert.strictEqual( cleanOutput( this ), "NN", "Initial content" );

	run( () => content.pushObjects([ { data: 2 }, { data: 3 } ]) );
	assert.strictEqual( cleanOutput( this ), "NNYN", "2 is a nested duplicate" );

	run( () => content.pushObjects([ { data: 1 }, { data: 2 }, { data: 3 } ]) );
	assert.strictEqual( cleanOutput( this ), "NNYNYYY", "1, 2 and 3 are nested duplicates" );

});


test( "Deferred nested duplicates", async function( assert ) {

	let resolveA, resolveB, resolveC;
	const A = new Promise( resolve => resolveA = resolve );
	const B = new Promise( resolve => resolveB = resolve );
	const C = new Promise( resolve => resolveC = resolve );

	const content = [ { data: Promise.resolve( 1 ) }, { data: Promise.resolve( 1 ) } ];
	const allResolvedAndRendered = async () => {
		await Promise.all( content.mapBy( "data" ) );
		return new Promise( resolve => scheduleOnce( "afterRender", resolve ) );
	};

	this.set( "content", content );
	this.render( hbs`
		{{#content-list content "data" true as |item new dup|}}
			{{if dup "Y" "N"}}
		{{/content-list}}
	` );

	assert.strictEqual(
		cleanOutput( this ),
		"NN",
		"Initially, there are no duplicates until checkDuplicates() has run asynchronously"
	);

	await allResolvedAndRendered();

	assert.strictEqual(
		cleanOutput( this ),
		"NY",
		"Duplicate check has run asynchronously and second item is now a duplicate"
	);

	run( () => content.pushObjects([ { data: A } ]) );
	assert.strictEqual(
		cleanOutput( this ),
		"NYN",
		"New pending item is not a duplicate until it has been resolved"
	);

	resolveA( 1 );
	await allResolvedAndRendered();

	assert.strictEqual(
		cleanOutput( this ),
		"NYY",
		"Item has been resolved and is now a duplicate"
	);

	run( () => content.pushObjects([ { data: B }, { data: C } ]) );
	assert.strictEqual(
		cleanOutput( this ),
		"NYYNN",
		"New pending items are no duplicates until they have been resolved"
	);

	resolveB( 2 );
	resolveC( 1 );
	await allResolvedAndRendered();

	assert.strictEqual(
		cleanOutput( this ),
		"NYYNY",
		"Items have been resolved and the last one is a duplicate"
	);

});
