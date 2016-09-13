import {
	get,
	set,
	Component
} from "Ember";
import layout from "templates/components/form/RadioBtnsComponent.hbs";


export default Component.extend({
	layout,

	tagName: "div",
	classNames: [ "radio-btns-component" ],

	optionValuePath: "value",
	optionLabelPath: "label",

	name: function() {
		let now = Date.now();
		let random = Math.floor( Math.random() * 10000000 );

		return `radio-btns-${now}${random}`;
	}.property(),

	content: null,
	value: null,
	selection: null,

	_updateItems() {
		var value   = get( this, "value" );
		var itemKey = get( this, "optionValuePath" );
		var content = get( this, "content" ) || [];
		var found   = false;

		content.forEach(function( item ) {
			var itemValue = get( item, itemKey );
			var checked = value === itemValue;

			// only check the first item
			set( item, "checked", checked && !found );

			if ( checked ) {
				found = true;
			}
		});

		return found;
	},

	init() {
		this._super.apply( this, arguments );
		// update each button's checked status on initialization
		this._updateItems();
	},

	_contentObserver: function() {
		if ( !this._updateItems() ) {
			// set the value to undefined if the selected item was removed
			set( this, "value", undefined );
		}
	}.observes( "content.[]" ),

	_valueObserver: function() {
		// update each button's checked status when the group's valuechanges
		this._updateItems();
	}.observes( "value", "optionValuePath" ),

	_selectionValueObserver: function() {
		// change the value if the selection or the selection's value changes
		set( this, "value", get( this, "selection.value" ) );
	}.observes( "selection.value" ),

	actions: {
		btnClicked( button ) {
			// update the current selection
			set( this, "selection", button );
		}
	}
});
