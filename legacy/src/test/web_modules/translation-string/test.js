import { module, test } from "qunit";

import t from "translation-key";


module( "translation-key", function() {
	test( "translation-key", function( assert ) {
		const bar = "bar";
		const qux = "qux";

		assert.strictEqual(
			t`foo`,
			"foo",
			"Returns a simple string"
		);
		assert.strictEqual(
			t`foo ${bar} baz ${qux} quux`,
			"foo bar baz qux quux",
			"Properly concats the template string with its expressions"
		);
	});
});
