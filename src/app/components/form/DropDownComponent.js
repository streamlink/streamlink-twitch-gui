import {
	get,
	set,
	computed,
	observer,
	Component
} from "ember";
import "selecter";
import layout from "templates/components/form/DropDownComponent.hbs";


export default Component.extend({
	layout,

	tagName: "select",
	classNameBindings: [ "class" ],
	attributeBindings: [ "disabled" ],

	content : computed(function() {
		return [];
	}),
	value   : null,
	disabled: false,

	optionValuePath: "id",
	optionLabelPath: "label",

	action: null,

	didInsertElement() {
		this._super( ...arguments );

		// TODO: remove Selecter dependency

		const classnames = [ ...this.element.classList ]
			.without( "ember-view" )
			.without( "ember-select" );
		classnames.unshift( "custom" );

		this.$().selecter({
			customClass: classnames.join( " " ),
			cover: true
		});
	},

	_valueChangedObserver: observer( "value", function() {
		const content = get( this, "content" );
		const path = get( this, "optionValuePath" );
		const value = get( this, "value" );

		if ( !content.findBy( path, value ) ) {
			return;
		}

		// update the element's value
		this.element.value = value;
		this.$().selecter( "refresh" );

		this.sendAction( "action", value );
	}),

	change() {
		const index = this.element.selectedIndex;
		const content = get( this, "content" );
		const path = get( this, "optionValuePath" );
		const value = get( content[ index ], path );
		set( this, "value", value );
	}
});
