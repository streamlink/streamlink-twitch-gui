import Component from "@ember/component";
import { get, set } from "@ember/object";
import { on } from "@ember/object/evented";
import layout from "./template.hbs";
import "./styles.less";


const { min, max } = Math;
const { isNaN, isInteger, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER } = Number;


export default Component.extend({
	layout,

	tagName: "div",
	classNames: [ "number-field-component" ],

	value: null,
	defaultValue: null,
	disabled: false,
	min: MIN_SAFE_INTEGER,
	max: MAX_SAFE_INTEGER,

	_prevValue: null,
	_value: null,

	_update: on( "init", "didReceiveAttrs", function() {
		this._super( ...arguments );
		const value = get( this, "value" );
		const parsedValue = this._parse( value );
		this._prevValue = value;
		set( this, "_value", String( parsedValue ) );
	}),

	didInsertElement() {
		this._super( ...arguments );
		this._input = this.element.querySelector( "input" );
	},

	_parse( value ) {
		let numValue = Number( value );

		// is the new value not a number?
		if ( isNaN( numValue ) ) {
			// use previous value if it exists
			const prevValue = this._prevValue;
			if ( prevValue !== null && !isNaN( Number( prevValue ) ) ) {
				return prevValue;
			}

			// otherwise, get the default value
			const defaultValue = get( this, "defaultValue" );
			if ( defaultValue !== null && !isNaN( Number( defaultValue ) ) ) {
				return defaultValue;
			}

			const min = get( this, "min" );
			const max = get( this, "max" );

			// or the average of min and max values if no default value exists either
			return ( ( min / 2 ) + ( max / 2 ) ) >> 0;
		}

		// only accept integers
		if ( !isInteger( numValue ) ) {
			numValue = numValue >> 0;
		}

		const min = get( this, "min" );
		const max = get( this, "max" );

		// maximum and minimum
		return numValue <= max
			? numValue >= min
			? numValue
			: min
			: max;
	},


	actions: {
		increase() {
			if ( get( this, "disabled" ) ) { return; }
			const maxValue = get( this, "max" );
			const currentValue = get( this, "value" );
			const value = min( currentValue + 1, maxValue );
			this.attrs.value.update( value );
		},

		decrease() {
			if ( get( this, "disabled" ) ) { return; }
			const minValue = get( this, "min" );
			const currentValue = get( this, "value" );
			const value = max( currentValue - 1, minValue );
			this.attrs.value.update( value );
		},

		blur() {
			if ( get( this, "disabled" ) ) { return; }
			const inputValue = this._input.value;
			const value = this._parse( inputValue );
			this._input.value = String( value );
			this.attrs.value.update( value );
		}
	}
});
