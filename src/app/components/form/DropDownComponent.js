import {
	get,
	set,
	computed,
	observer,
	Component
} from "Ember";
import {} from "Selecter";
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
		this._super();

		// TODO: remove Selecter dependency

		var classnames = [].slice.call( this.element.classList )
			.without( "ember-view" )
			.without( "ember-select" );
		classnames.unshift( "custom" );

		this.$().selecter({
			customClass: classnames.join( " " ),
			cover: true
		});
	},

	_valueChangedObserver: observer( "value", function() {
		var content = get( this, "content" );
		var path    = get( this, "optionValuePath" );
		var value   = get( this, "value" );

		if ( !content.findBy( path, value ) ) {
			return;
		}

		// update the element's value
		this.element.value = value;
		this.$().selecter( "refresh" );

		this.sendAction( "action", value );
	}),

	change() {
		var index   = this.element.selectedIndex;
		var content = get( this, "content" );
		var path    = get( this, "optionValuePath" );
		var value   = get( content[ index ], path );
		set( this, "value", value );
	}
});
