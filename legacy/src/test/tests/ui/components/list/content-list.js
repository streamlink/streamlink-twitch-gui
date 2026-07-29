import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver, cleanOutput } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { A } from "@ember/array";
import Component from "@ember/component";
import { run } from "@ember/runloop";

import ContentListComponent from "ui/components/list/content-list/component";
import { helper as GetIndexHelper } from "ui/components/helper/get-index";
import { helper as IsGteHelper } from "ui/components/helper/is-gte";


module( "ui/components/list/content-list", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			ContentListComponent,
			InfiniteScrollComponent: Component.extend(),
			GetIndexHelper,
			IsGteHelper
		})
	});


	test( "Empty content", async function( assert ) {
		const content = A();

		this.set( "content", content );
		await render( hbs`
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


	test( "New items", async function( assert ) {
		const content = A([ 1, 2 ]);

		this.set( "content", content );
		await render( hbs`
			{{#content-list content as |item new|}}
				{{if new "Y" "N"}}
			{{/content-list}}
		` );

		assert.strictEqual( cleanOutput( this ), "NN", "Initial content" );

		run( () => content.pushObjects([ 3, 4 ]) );
		assert.strictEqual( cleanOutput( this ), "NNYY", "Unique items" );
	});


	test( "Duplicates", async function( assert ) {
		const content = A([ 1, 2 ]);

		this.set( "content", content );
		await render( hbs`
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


	test( "Simple nested duplicates", async function( assert ) {
		const content = A([ { data: 1 }, { data: 2 } ]);

		this.set( "content", content );
		await render( hbs`
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
		let resolveA, resolveB, resolveC, resolveD;
		const a = new Promise( resolve => resolveA = resolve );
		const b = new Promise( resolve => resolveB = resolve );
		const c = new Promise( resolve => resolveC = resolve );
		const d = new Promise( resolve => resolveD = resolve );

		// same promise in initial content array
		const content = A([
			{ data: a },
			{ data: a }
		]);
		const allResolvedAndRendered = async () => {
			await Promise.all( content.mapBy( "data" ) );
			// trigger a runloop
			run( () => {} );
		};

		this.set( "content", content );
		await render( hbs`
			{{#content-list content "data" true as |item new dup|}}
				{{if dup "Y" "N"}}
			{{/content-list}}
		` );

		assert.strictEqual(
			cleanOutput( this ),
			"NN",
			"Initially, there are no duplicates until checkDuplicates() has run asynchronously"
		);

		// noinspection JSUnusedAssignment
		resolveA( 1 );
		await allResolvedAndRendered();

		assert.strictEqual(
			cleanOutput( this ),
			"NY",
			"Duplicate check has run asynchronously and second item is now a duplicate"
		);

		run( () => content.pushObjects([ { data: b } ]) );
		assert.strictEqual(
			cleanOutput( this ),
			"NYN",
			"New pending item is not a duplicate until it has been resolved"
		);

		// noinspection JSUnusedAssignment
		resolveB( 1 );
		await allResolvedAndRendered();

		assert.strictEqual(
			cleanOutput( this ),
			"NYY",
			"Item has been resolved and is now a duplicate"
		);

		run( () => content.pushObjects([ { data: c }, { data: d } ]) );
		assert.strictEqual(
			cleanOutput( this ),
			"NYYNN",
			"New pending items are no duplicates until they have been resolved"
		);

		// noinspection JSUnusedAssignment
		resolveC( 2 );
		// noinspection JSUnusedAssignment
		resolveD( 1 );
		await allResolvedAndRendered();

		assert.strictEqual(
			cleanOutput( this ),
			"NYYNY",
			"Items have been resolved and the last one is a duplicate"
		);
	});

});
