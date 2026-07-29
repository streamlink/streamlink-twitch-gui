import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { helper as IsEqualHelper } from "ui/components/helper/is-equal";
import { helper as IsNullHelper } from "ui/components/helper/is-null";
import { helper as IsGtHelper } from "ui/components/helper/is-gt";
import { helper as IsGteHelper } from "ui/components/helper/is-gte";


module( "ui/components/helper/is-", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			IsEqualHelper,
			IsNullHelper,
			IsGtHelper,
			IsGteHelper
		})
	});


	test( "Is equal", async function( assert ) {
		this.setProperties({
			valA: "foo",
			valB: "foo",
			valC: "foo"
		});
		await render( hbs`{{is-equal valA valB valC}}` );

		assert.strictEqual( this.element.innerText, "true", "Equal values" );

		this.set( "valC", "bar" );
		assert.strictEqual( this.element.innerText, "false", "Unequal values" );
	});


	test( "Is null", async function( assert ) {
		this.setProperties({
			valA: null,
			valB: null,
			valC: null
		});
		await render( hbs`{{is-null valA valB valC}}` );

		assert.strictEqual( this.element.innerText, "true", "All values are null" );

		this.set( "valC", false );
		assert.strictEqual( this.element.innerText, "false", "Some values are not null" );
	});


	test( "Is greater than", async function( assert ) {
		this.setProperties({
			valA: 2,
			valB: 1
		});
		await render( hbs`{{is-gt valA valB}}` );

		assert.strictEqual( this.element.innerText, "true", "2 is greater than 1" );

		this.set( "valA", 0 );
		assert.strictEqual( this.element.innerText, "false", "0 is not greater than 1" );
	});


	test( "Is greater than or equal", async function( assert ) {
		this.setProperties({
			valA: 2,
			valB: 1
		});
		await render( hbs`{{is-gte valA valB}}` );

		assert.strictEqual( this.element.innerText, "true", "2 is greater than or equal 1" );

		this.set( "valA", 1 );
		assert.strictEqual( this.element.innerText, "true", "1 is greater than or equal 1" );

		this.set( "valA", 0 );
		assert.strictEqual( this.element.innerText, "false", "0 is not greater than or equal 1" );
	});

});
