import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { helper as FindByHelper } from "ui/components/helper/find-by";


module( "ui/components/helper/find-by", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			FindByHelper
		})
	});


	test( "FindByHelper", async function( assert ) {
		this.setProperties({
			arr: [
				{ foo: 1, bar: "one" },
				{ foo: 2, bar: "two" }
			]
		});
		await render( hbs`{{get (find-by arr "foo" 2) "bar"}}` );

		assert.strictEqual( this.element.innerText, "two", "Finds two" );
	});

});
