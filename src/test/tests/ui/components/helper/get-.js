import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { helper as GetParamHelper } from "ui/components/helper/get-param";
import { helper as GetIndexHelper } from "ui/components/helper/get-index";


module( "ui/components/helper/get-", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			GetParamHelper,
			GetIndexHelper
		})
	});


	test( "Get param", async function( assert ) {
		this.setProperties({
			param: "baz",
			index: 0
		});
		await render( hbs`{{get-param "foo" "bar" param index=index}}` );

		assert.strictEqual( this.element.innerText, "foo", "First parameter's value is foo" );

		this.set( "index", 2 );
		assert.strictEqual( this.element.innerText, "baz", "Bound parameter" );

		this.set( "param", "qux" );
		assert.strictEqual( this.element.innerText, "qux", "Changed bound parameter" );
	});


	test( "Get index", async function( assert ) {
		this.setProperties({
			arr: [ 4, 5, 6 ],
			prop: 1
		});
		await render( hbs`{{get-index arr prop}}` );

		assert.strictEqual( this.element.innerText, "5", "Gets the correcy value" );

		this.set( "prop", 2 );
		assert.strictEqual( this.element.innerText, "6", "Change index" );

		this.set( "prop", 9999 );
		assert.strictEqual( this.element.innerText, "", "Non-existing index" );
	});

});
