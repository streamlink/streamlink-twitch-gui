import {
	get,
	set,
	computed,
	Component
} from "Ember";
import layout from "templates/components/form/NumberFieldComponent.hbs";


const min = Math.min;
const max = Math.max;
const isInteger = Number.isInteger;


export default Component.extend({
	layout,

	tagName: "div",
	classNames: [ "number-field-component" ],

	"default": null,
	disabled: false,

	didInsertElement: function() {
		this._input = this.$( "input" )[0];
		this._super.apply( this, arguments );
	},

	parse( value ) {
		let min = get( this, "min" );
		let max = get( this, "max" );
		value = parseInt( value, 10 );

		if ( isNaN( value ) ) {
			if ( this._value !== null ) {
				value = this._value;
			} else {
				let defValue = get( this, "default" );
				if ( defValue !== null ) {
					value = defValue;
				} else {
					value = ( ( min / 2 ) + ( max / 2 ) ) >> 0;
				}
			}

		} else {
			if ( !isInteger( value ) ) {
				value = value >> 0;
			}

			if ( value > max ) {
				value = max;
			} else if ( value < min ) {
				value = min;
			}
		}

		return value;
	},

	_min: Number.MIN_SAFE_INTEGER,
	min: computed({
		get() {
			return this._min;
		},
		set( key, value ) {
			value = Number( value );
			if ( isNaN( value ) ) {
				throw new Error( "Minimum value must be a number" );
			} else if ( !isInteger( value ) ) {
				value = value >> 0;
			}

			return ( this._min = value );
		}
	}),

	_max: Number.MAX_SAFE_INTEGER,
	max: computed({
		get() {
			return this._max;
		},
		set( key, value ) {
			value = Number( value );
			if ( isNaN( value ) ) {
				throw new Error( "Maximum value must be a number" );
			} else if ( !Number.isInteger( value ) ) {
				value = value >> 0;
			}

			return ( this._max = value );
		}
	}),

	_value: null,
	value: computed({
		get() {
			return this._value;
		},
		set( key, value ) {
			return ( this._value = this.parse( value ) );
		}
	}),

	actions: {
		increase() {
			if ( get( this, "disabled" ) ) { return; }
			let value = get( this, "value" );
			set( this, "value", min( ++value, get( this, "max" ) ) );
		},

		decrease() {
			if ( get( this, "disabled" ) ) { return; }
			let value = get( this, "value" );
			set( this, "value", max( --value, get( this, "min" ) ) );
		},

		blur() {
			let value = this.parse( this._input.value );
			set( this, "value", value );
			this._input.value = value;
		}
	}
});
