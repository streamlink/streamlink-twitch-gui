import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import Component from "@ember/component";
import { default as EmberObject, setProperties } from "@ember/object";
import { alias, equal } from "@ember/object/computed";
import { layout } from "@ember-decorators/component";

import { computedOverride } from "utils/decorators";


module( "utils/decorators/computed-override", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver()
	});


	test( "@computedOverride", async function( assert ) {
		@layout( hbs`{{this.foo}}:{{this.bar}}:{{this.baz}}` )
		class A extends Component {
			@computedOverride()
			get foo() {
				return 1;
			}

			@computedOverride()
			bar = 2;

			@computedOverride()
			@equal( "qux", 4 )
			baz;

			qux = 4;
		}

		class B extends A {
			@computedOverride()
			foo = -1;

			@computedOverride()
			get bar() {
				return -2;
			}
		}

		this.owner.register( "component:a", A );
		this.owner.register( "component:b", B );

		const a = this.owner.lookup( "component:a" );
		const b = this.owner.lookup( "component:b" );

		assert.strictEqual( a.foo, 1, "Getter of foo returns 1" );
		assert.strictEqual( a.bar, 2, "Initial value of bar returns 2" );
		assert.strictEqual( a.baz, true, "Initial value of baz returns true" );

		setProperties( a, {
			qux: 44
		});
		assert.strictEqual( a.baz, false, "a.baz gets re-computed" );

		setProperties( a, {
			foo: 11,
			bar: 22,
			baz: 33
		});
		assert.strictEqual( a.foo, 11, "a.foo has been overridden" );
		assert.strictEqual( a.bar, 22, "a.bar has been overridden" );
		assert.strictEqual( a.baz, 33, "a.baz has been overridden" );

		setProperties( a, {
			qux: 0
		});
		assert.strictEqual( a.baz, 33, "a.baz doesn't get re-computed" );

		setProperties( a, {
			foo: 111,
			bar: 222,
			baz: 333
		});
		assert.strictEqual( a.foo, 111, "a.foo has a new value again" );
		assert.strictEqual( a.bar, 222, "a.bar has a new value again" );
		assert.strictEqual( a.baz, 333, "a.baz has a new value again" );


		assert.strictEqual( b.foo, -1, "Getter uses the right context" );
		assert.strictEqual( b.bar, -2, "Getter uses the right context" );
		assert.strictEqual( b.baz, true, "b.baz getter is defined on A's prototype" );

		setProperties( b, {
			foo: 1000,
			bar: 2000,
			baz: 3000
		});
		assert.strictEqual( b.foo, 1000, "b.foo has been overridden" );
		assert.strictEqual( b.bar, 2000, "b.bar has been overridden" );
		assert.strictEqual( b.baz, 3000, "b.baz has been set" );
		assert.strictEqual( a.foo, 111, "Setter uses the right context" );
		assert.strictEqual( a.bar, 222, "Setter uses the right context" );
		assert.strictEqual( a.baz, 333, "Setter uses the right context" );

		this.setProperties({
			foo: 9,
			cls: (class extends EmberObject {
				@alias( "bar" )
				foo;
				bar = 8;
			}).create()
		});
		// language=Handlebars
		await render( hbs`<A @foo={{this.foo}} @bar={{this.cls.foo}} @baz={{7}} />` );

		assert.strictEqual( this.element.textContent, "9:8:7", "Component property override" );
		this.set( "cls.bar", 6 );
		assert.strictEqual( this.element.textContent, "9:6:7", "Component property changed" );
	});

	test( "@computedOverride with custom setter", async function( assert ) {
		class Foo {
			@computedOverride(function( value ) {
				return value < 3
					? value
					: 0;
			})
			get foo() {
				return 1;
			}
		}

		const foo = new Foo();
		assert.strictEqual( foo.foo, 1, "Returns default getter initially" );
		foo.foo = 2;
		assert.strictEqual( foo.foo, 2, "foo is now 2" );
		foo.foo = 3;
		assert.strictEqual( foo.foo, 0, "foo is now 0 instead of 3" );
	});
});
