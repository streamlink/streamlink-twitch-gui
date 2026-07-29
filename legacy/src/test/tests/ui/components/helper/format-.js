import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { helper as FormatViewersHelper } from "ui/components/helper/format-viewers";


module( "ui/components/helper/format-", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			FormatViewersHelper
		})
	});


	test( "Format viewers", async function( assert ) {
		this.set( "viewers", "" );
		await render( hbs`{{format-viewers viewers}}` );

		assert.strictEqual( this.element.innerText, "0", "Unexpected values" );
		this.set( "viewers", "foo" );
		assert.strictEqual( this.element.innerText, "0", "Unexpected values" );

		this.set( "viewers", 9 );
		assert.strictEqual( this.element.innerText, "9", "Less than 5 digits" );
		this.set( "viewers", 99 );
		assert.strictEqual( this.element.innerText, "99", "Less than 5 digits" );
		this.set( "viewers", 999 );
		assert.strictEqual( this.element.innerText, "999", "Less than 5 digits" );
		this.set( "viewers", 9999 );
		assert.strictEqual( this.element.innerText, "9999", "Less than 5 digits" );

		this.set( "viewers", 10000 );
		assert.strictEqual( this.element.innerText, "10.0k", "Thousands" );
		this.set( "viewers", 10099 );
		assert.strictEqual( this.element.innerText, "10.0k", "Thousands" );
		this.set( "viewers", 10100 );
		assert.strictEqual( this.element.innerText, "10.1k", "Thousands" );
		this.set( "viewers", 99999 );
		assert.strictEqual( this.element.innerText, "99.9k", "Thousands" );
		this.set( "viewers", 100000 );
		assert.strictEqual( this.element.innerText, "100k", "Thousands" );
		this.set( "viewers", 999999 );
		assert.strictEqual( this.element.innerText, "999k", "Thousands" );

		this.set( "viewers", 1000000 );
		assert.strictEqual( this.element.innerText, "1.00m", "Millions" );
		this.set( "viewers", 1009999 );
		assert.strictEqual( this.element.innerText, "1.00m", "Millions" );
		this.set( "viewers", 1010000 );
		assert.strictEqual( this.element.innerText, "1.01m", "Millions" );
	});
});
