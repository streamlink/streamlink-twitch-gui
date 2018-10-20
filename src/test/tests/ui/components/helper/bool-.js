import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { helper as BoolNotHelper } from "ui/components/helper/bool-not";
import { helper as BoolAndHelper } from "ui/components/helper/bool-and";
import { helper as BoolOrHelper } from "ui/components/helper/bool-or";


module( "ui/components/helper/bool-", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			BoolNotHelper,
			BoolAndHelper,
			BoolOrHelper
		})
	});


	test( "Bool not", async function( assert ) {
		this.setProperties({
			valA: false,
			valB: null,
			valC: undefined,
			valD: ""
		});
		await render( hbs`{{bool-not valA valB valC valD}}` );

		assert.strictEqual( this.element.innerText, "true", "All values are falsey" );

		this.set( "valA", true );
		assert.equal( this.element.innerText, "false", "Not all values are falsey" );
	});


	test( "Bool and", async function( assert ) {
		this.setProperties({
			valA: false,
			valB: false,
			valC: false
		});
		await render( hbs`{{bool-and valA valB valC}}` );

		assert.strictEqual( this.element.innerText, "false", "not A and not B and not C" );

		this.set( "valA", true );
		assert.strictEqual( this.element.innerText, "false", "A and not B and not C" );

		this.set( "valB", true );
		assert.strictEqual( this.element.innerText, "false", "A and B and not C" );

		this.set( "valC", true );
		assert.strictEqual( this.element.innerText, "true", "A and B and C" );
	});


	test( "Bool or", async function( assert ) {
		this.setProperties({
			valA: true,
			valB: true,
			valC: true
		});
		await render( hbs`{{bool-or valA valB valC}}` );

		assert.strictEqual( this.element.innerText, "true", "A or B or C" );

		this.set( "valA", false );
		assert.strictEqual( this.element.innerText, "true", "not A or B or C" );

		this.set( "valB", false );
		assert.strictEqual( this.element.innerText, "true", "not A or not B or C" );

		this.set( "valC", false );
		assert.strictEqual( this.element.innerText, "false", "not A or not B or not C" );
	});

});
