import { module, test } from "qunit";

import { descriptor, name } from "utils/decorators";


module( "utils/decorators/object", function() {
	test( "@descriptor", function( assert ) {
		class Cls {
			@descriptor({
				configurable: false,
				enumerable: false,
				writable: false,
				value: 1
			})
			foo = 0;

			bar = 1;

			@descriptor({
				get() {
					return this.bar;
				},
				set( value ) {
					this.bar = value;
				}
			})
			baz = 2;

			@descriptor({
				get() {
					return this.bar;
				},
				set( value ) {
					this.bar = value;
				}
			})
			/* istanbul ignore next */
			get qux() {
				return undefined;
			}
			/* istanbul ignore next */
			set qux( value ) {}
		}

		const inst = new Cls();
		const descr = Object.getOwnPropertyDescriptor( Cls.prototype, "foo" );

		assert.strictEqual( descr.configurable, false, "foo is not configurable" );
		assert.strictEqual( descr.enumerable, false, "foo is not enumerable" );
		assert.strictEqual( descr.writable, false, "foo is not writable" );
		assert.strictEqual( descr.value, 1, "Cls.prototype.foo has a value of 1" );
		assert.strictEqual( inst.foo, 1, "foo has a value of 1" );

		assert.strictEqual( inst.baz, 1, "baz getter" );
		inst.baz = 2;
		assert.strictEqual( inst.baz, 2, "baz getter" );

		assert.strictEqual( inst.qux, 2, "qux getter" );
		inst.qux = 3;
		assert.strictEqual( inst.qux, 3, "qux getter" );
	});


	test( "@name", function( assert ) {
		@name( "foo" )
		class A {}

		assert.strictEqual( A.toString(), "foo", "Sets the static toString() method" );
	});
});
