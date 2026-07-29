import { module, test } from "qunit";

import updateNamespaces from "init/initializers/localstorage/namespaces";


module( "init/initializers/localstorage/namespaces" );


test( "App namespace does not exist", assert => {

	assert.expect( 1 );

	const LS = {
		getItem( item ) {
			assert.strictEqual( item, "app", "Reads app namespace" );
			return null;
		}
	};

	updateNamespaces( LS );

});


test( "Creates namespaces from old app namespace", assert => {

	assert.expect( 8 );

	const expected = [
		[ "foo", JSON.stringify({ foo: 1 }) ],
		[ "bar", JSON.stringify({ bar: 2 }) ],
		[ "baz", JSON.stringify({ baz: 3 }) ]
	];

	const LS = {
		getItem( item ) {
			assert.strictEqual( item, "app", "Reads app namespace" );
			return JSON.stringify({
				foo: { foo: 1 },
				bar: { bar: 2 },
				baz: { baz: 3 }
			});
		},
		setItem( item, value ) {
			const [ expectedItem, expectedValue ] = expected.shift();
			assert.strictEqual( item, expectedItem );
			assert.strictEqual( value, expectedValue );
		},
		removeItem( item ) {
			assert.strictEqual( item, "app", "Removes app namespace" );
		}
	};

	updateNamespaces( LS );

});
