import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore } from "store-utils";

import attr from "ember-data/attr";
import Model from "ember-data/model";
import Fragment from "ember-data-model-fragments/fragment";
import ModelFragmentsInitializer from "init/initializers/model-fragments";

import { fragment, urlFragments } from "utils/decorators";


module( "utils/decorators/data", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver()
	});


	test( "@fragment", function( assert ) {
		ModelFragmentsInitializer.initialize( this.owner );
		const { store } = setupStore( this.owner );

		this.owner.register( "model:foo", class Foo extends Model {
			@fragment( "bar" )
			bar;
			@fragment( "baz", { defaultValue: { qux: true } } )
			baz;
		});
		this.owner.register( "model:bar", class Bar extends Fragment {
			@attr( "boolean", { defaultValue: false } )
			qux;
		});
		this.owner.register( "model:baz", class Baz extends Fragment {
			@attr( "boolean", { defaultValue: false } )
			qux;
		});

		const foo = store.createRecord( "foo", { id: 1 } );
		assert.propEqual(
			foo.toJSON({ includeId: true }),
			{
				id: "1",
				bar: {
					qux: false
				},
				baz: {
					qux: true
				}
			},
			"Properly serializes model"
		);
	});


	test( "@urlFragments", function( assert ) {
		const foo1 = new Function();
		const foo2 = new Function();
		const bar = new Function();
		const baz = new Function();

		@urlFragments({ foo: foo1, bar })
		class A {}

		@urlFragments({ foo: foo2, baz })
		class B extends A {}

		assert.notStrictEqual( A.urlFragments, B.urlFragments, "A and B urlFragments are unique" );
		assert.strictEqual( A.urlFragments.foo, foo1, "A has foo1 in its urlFragments" );
		assert.strictEqual( A.urlFragments.bar, bar, "A has bar in its urlFragments" );
		assert.strictEqual( B.urlFragments.foo, foo2, "B has foo2 in its urlFragments" );
		assert.strictEqual( B.urlFragments.bar, bar, "B has bar in its urlFragments" );
		assert.strictEqual( B.urlFragments.baz, baz, "B has baz in its urlFragments" );
	});
});
