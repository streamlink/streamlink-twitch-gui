import {
	get,
	set,
	$,
	computed,
	observer,
	Component
} from "ember";
import HotkeyMixin from "mixins/HotkeyMixin";
import layout from "templates/components/form/DropDownComponent.hbs";


function switchSelectionOnArrowKey( change ) {
	return function() {
		if ( !this.isFocused() || !get( this, "_isExpanded" ) ) {
			return true;
		}
		const content = get( this, "content" );
		const selection = get( this, "_selection" );
		const selIndex = content.indexOf( selection );
		if ( selIndex === -1 ) {
			return true;
		}
		const newIndex = ( selIndex + change + content.length ) % content.length;
		const newSelection = content[ newIndex ];
		set( this, "_selection", newSelection );
	};
}


export default Component.extend( HotkeyMixin, {
	layout,

	tagName: "div",
	classNameBindings: [
		":drop-down-component",
		"_isExpanded:expanded",
		"_expandUpwards:expanded-upwards",
		"disabled:disabled",
		"class"
	],
	attributeBindings: [ "tabindex" ],

	tabindex: 0,
	disabled: false,
	buttonClass: "",

	placeholder: "Please choose",

	optionValuePath: "id",
	optionLabelPath: "label",

	value: null,
	content: computed( () => ([]) ),

	_lastValue: null,
	_selection: null,
	_selectionValueObserver: null,
	_isExpanded: false,
	_expandUpwards: false,
	_clickListener: null,
	_offsetParent: null,
	_list: null,


	hotkeys: [
		{
			code: [ "Escape", "Backspace" ],
			action() {
				if ( get( this, "_isExpanded" ) ) {
					set( this, "_isExpanded", false );
					return false;
				}
				if ( this.isFocused() ) {
					this.$().blur();
					return false;
				}
				// let the event bubble up
				return true;
			}
		},
		{
			code: "Space",
			action() {
				if ( !this.isFocused() ) {
					return true;
				}
				this.send( "toggle" );
			}
		},
		{
			code: "ArrowUp",
			action: switchSelectionOnArrowKey( -1 )
		},
		{
			code: "ArrowDown",
			action: switchSelectionOnArrowKey( +1 )
		}
	],

	isFocused() {
		return this.element.ownerDocument.activeElement === this.element;
	},


	didInsertElement() {
		const $elem = this.$();
		this._list = $elem.children( ".drop-down-component-list" ).eq( 0 );
		this._offsetParent = $elem.offsetParent()[ 0 ];

		return this._super( ...arguments );
	},

	willDestroyElement() {
		this._removeClickListener();
		this._list = this._offsetParent = null;

		return this._super( ...arguments );
	},


	_updateValue( value ) {
		set( this, "value", value );
		if ( this.attrs ) {
			this.attrs.value.update( value );
		}
	},

	// update the selection when the value gets updated
	_valueObserver: observer( "value", function() {
		const value = get( this, "value" );
		if ( value === null || value === this._lastValue ) {
			return;
		}
		this._lastValue = value;
		// set the current selection based on the current value found in the content array
		const content = get( this, "content" );
		const optionValuePath = get( this, "optionValuePath" );
		const selection = content.find( item => value === get( item, optionValuePath ) );
		set( this, "_selection", selection );
	}).on( "init" ),


	// update value when the selection or optionValuePath changes
	// and register an observer that updates the value when the selection's value changes
	_selectionObserver: observer( "_selection", "optionValuePath", function() {
		// always remove the old observer
		if ( this._selectionValueObserver ) {
			this.removeObserver( ...this._selectionValueObserver );
			this._selectionValueObserver = null;
		}

		if ( !get( this, "_selection" ) ) {
			return;
		}

		// observe the selection's value property
		// and update the component's value now and once the selection's value changes
		const optionValuePath = get( this, "optionValuePath" );
		const path = `_selection.${optionValuePath}`;
		const copyValue = () => {
			const value = get( this, path );
			this._updateValue( value );
		};
		this._selectionValueObserver = [ path, this, copyValue ];
		this.addObserver( ...this._selectionValueObserver );
		copyValue();
	}),

	_contentObserver: observer( "content.[]", function() {
		// unset selection and value if the selection gets removed from the content
		const selection = get( this, "_selection" );
		const content = get( this, "content" );
		if ( !content.includes( selection ) ) {
			set( this, "_selection", null );
			this._updateValue( null );
		}
	}),


	// register a click event listener on the document body that closes the dropdown
	_isExpandedObserver: observer( "_isExpanded", function() {
		this._removeClickListener();

		if ( !get( this, "_isExpanded" ) ) {
			return;
		}

		const listener = this._clickListener = event => {
			// ignore clicks on the DropDownComponent
			if ( !$( event.target ).closest( this.element ).length ) {
				set( this, "_isExpanded", false );
			}
		};
		$( this.element.ownerDocument.body ).on( "click", listener );
	}),


	_removeClickListener() {
		// unregister click event listener
		if ( this._clickListener ) {
			$( this.element.ownerDocument.body ).off( "click", this._clickListener );
			this._clickListener = null;
		}
	},

	_calcExpansionDirection() {
		const parentHeight = this._offsetParent.offsetHeight;
		const positionTop = this.$().position().top;
		const listHeight = this._list.height();
		const isOverflowing = parentHeight - positionTop < listHeight;
		set( this, "_expandUpwards", isOverflowing );
	},


	actions: {
		toggle() {
			if ( get( this, "disabled" ) || get( this, "_isExpanded" ) ) {
				set( this, "_isExpanded", false );
			} else {
				this._calcExpansionDirection();
				set( this, "_isExpanded", true );
			}
		},

		change( item ) {
			if ( !get( this, "disabled" ) ) {
				set( this, "_selection", item );
				set( this, "_isExpanded", false );
			}
		}
	}
});
