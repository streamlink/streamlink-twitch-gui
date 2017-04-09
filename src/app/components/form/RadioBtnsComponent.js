import {
	get,
	set,
	computed,
	observer,
	Component
} from "ember";
import layout from "templates/components/form/RadioBtnsComponent.hbs";


export default Component.extend({
	layout,

	tagName: "div",
	classNames: [ "radio-btns-component" ],

	optionValuePath: "value",
	optionLabelPath: "label",

	name: computed(function() {
		let now = Date.now();
		let random = Math.floor( Math.random() * 10000000 );

		return `radio-btns-${now}${random}`;
	}),

	content: null,
	value: null,
	selection: null,

	_updateItems() {
		const value   = get( this, "value" );
		const itemKey = get( this, "optionValuePath" );
		const content = get( this, "content" ) || [];
		let found   = false;

		content.forEach(function( item ) {
			const itemValue = get( item, itemKey );
			const checked = value === itemValue;

			// only check the first item
			set( item, "checked", checked && !found );

			if ( checked ) {
				found = true;
			}
		});

		return found;
	},

	init() {
		this._super( ...arguments );
		// update each button's checked status on initialization
		this._updateItems();
	},

	_contentObserver: observer( "content.[]", function() {
		if ( !this._updateItems() ) {
			// set the value to undefined if the selected item was removed
			set( this, "value", undefined );
		}
	}),

	_valueObserver: observer( "value", "optionValuePath", function() {
		// update each button's checked status when the group's valuechanges
		this._updateItems();
	}),

	_selectionValueObserver: observer( "selection.value", function() {
		// change the value if the selection or the selection's value changes
		set( this, "value", get( this, "selection.value" ) );
	}),

	actions: {
		btnClicked( button ) {
			// update the current selection
			set( this, "selection", button );
		}
	}
});
