import Component from "@ember/component";
import { set, action } from "@ember/object";
import { classNames, layout, tagName } from "@ember-decorators/component";
import { on } from "@ember-decorators/object";
import template from "./template.hbs";
import "./styles.less";


const { min, max } = Math;
const { isNaN, isInteger, MIN_SAFE_INTEGER, MAX_SAFE_INTEGER } = Number;


@layout( template )
@tagName( "div" )
@classNames( "number-field-component" )
export default class NumberFieldComponent extends Component {
	/** @type {number|null} */
	value = null;
	/** @type {number|null} */
	defaultValue = null;
	disabled = false;
	min = MIN_SAFE_INTEGER;
	max = MAX_SAFE_INTEGER;

	_prevValue = null;
	_value = null;


	@on( "init", "didReceiveAttrs" )
	_update() {
		const value = this.value;
		const parsedValue = this._parse( value );
		this._prevValue = value;
		set( this, "_value", String( parsedValue ) );
	}

	@on( "didInsertElement" )
	_getInputElement() {
		this._input = this.element.querySelector( "input" );
	}

	_parse( value ) {
		let numValue = Number( value );

		// is the new value not a number?
		if ( isNaN( numValue ) ) {
			// use previous value if it exists
			const { _prevValue: prevValue } = this;
			if ( prevValue !== null && !isNaN( Number( prevValue ) ) ) {
				return prevValue;
			}

			// otherwise, get the default value
			const { defaultValue } = this;
			if ( defaultValue !== null && !isNaN( Number( defaultValue ) ) ) {
				return defaultValue;
			}

			const { min, max } = this;

			// or the average of min and max values if no default value exists either
			return ( ( min / 2 ) + ( max / 2 ) ) >> 0;
		}

		// only accept integers
		if ( !isInteger( numValue ) ) {
			numValue = numValue >> 0;
		}

		const { min, max } = this;

		// maximum and minimum
		return numValue <= max
			? numValue >= min
				? numValue
				: min
			: max;
	}


	@action
	increase() {
		if ( this.disabled ) { return; }
		const newValue = min( this.value + 1, this.max );
		set( this, "value", newValue );
	}

	@action
	decrease() {
		if ( this.disabled ) { return; }
		const newValue = max( this.value - 1, this.min );
		set( this, "value", newValue );
	}

	@action
	blur() {
		if ( this.disabled ) { return; }
		const inputValue = this._input.value;
		const newValue = this._parse( inputValue );
		this._input.value = String( newValue );
		set( this, "value", newValue );
	}
}
