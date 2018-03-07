import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";

import FindByHelper from "helpers/FindByHelper";


moduleForComponent( "helpers/FindByHelper", {
	integration: true,
	resolver: buildResolver({
		FindByHelper
	})
});


test( "FindByHelper", function( assert ) {

	this.setProperties({
		arr: [
			{ foo: 1, bar: "one" },
			{ foo: 2, bar: "two" }
		]
	});
	this.render( hbs`{{get (find-by arr "foo" 2) "bar"}}` );
	assert.strictEqual( this.$().text().trim(), "two", "Finds two" );

});
