import Ember from "ember";
import { defineProperty } from "@ember/object";


/**
 * Property decorator:
 * Implements backwards compatibility for overridable computed properties in Ember.
 * https://deprecations.emberjs.com/v3.x#toc_computed-property-override
 * Overridden values get stored on the `_${name}` property on a class instance while default
 * values are stored on the class's prototype.
 * Supports field initializers and getters/setters and also respects Ember's computed properties.
 * @param {Function?} customSetter
 * @returns {function(Object, string, PropertyDescriptor): PropertyDescriptor}
 */
export function computedOverride( customSetter ) {
	return function( target, key, descriptor ) {
		const propOverride = `_${key}`;

		const meta = Ember.meta( target );
		const cpDescr = meta && meta.peekDescriptors( key );

		// turn decorated field properties into getters and setters
		if ( !descriptor.get && descriptor.initializer && descriptor.writable ) {
			// initialize with field value
			target[ propOverride ] = descriptor.initializer();
			descriptor.get = function() {
				return this[ propOverride ];
			};
			// remove field specific descriptor properties
			delete descriptor.initializer;
			delete descriptor.writable;
		}

		const setter = typeof customSetter === "function"
			? function set( value ) {
				this[ propOverride ] = customSetter( value );
			}
			: function set( value ) {
				this[ propOverride ] = value;
			};

		// replace the descriptor's get and set methods on the first set call
		descriptor.set = function( value ) {
			const descriptor = Object.getOwnPropertyDescriptor( target, key );
			descriptor.get = function() {
				return this[ propOverride ];
			};
			descriptor.set = setter;
			// define the new descriptor on the actual class instance, not the prototype
			// use Ember's defineProperty, so that computed properties can properly be torn down
			defineProperty( this, key, descriptor );

			setter.call( this, value );
		};

		// if an Ember computed property exists, define/override its setter
		if ( cpDescr ) {
			cpDescr.set = function( obj, keyName, value ) {
				descriptor.set.call( obj, value );
			};
		}

		return descriptor;
	};
}
