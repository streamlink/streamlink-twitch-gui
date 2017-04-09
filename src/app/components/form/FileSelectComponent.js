import {
	get,
	set,
	$,
	on,
	Component
} from "ember";
import layout from "templates/components/form/FileSelectComponent.hbs";


export default Component.extend({
	layout,

	tagName: "div",
	classNames: [ "input-group" ],

	value: "",
	placeholder: "",
	disabled: false,

	_createInput: on( "init", function() {
		const component = this;
		this._input = $( "<input>" )
			.addClass( "hidden" )
			.attr({
				type: "file",
				tabindex: -1
			})
			.change(function() {
				if ( !this.value.length ) { return; }
				set( component, "value", this.value );
				this.files.clear();
			});
	}),

	actions: {
		selectfile() {
			if ( !get( this, "disabled" ) ) {
				this._input.click();
			}
		}
	}
});
