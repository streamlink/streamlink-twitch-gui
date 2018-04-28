import Component from "@ember/component";
import { get, set, computed } from "@ember/object";
import { on } from "@ember/object/evented";
import { inject as service } from "@ember/service";
import $ from "jquery";
import { platform } from "utils/node/platform";
import layout from "./template.hbs";


const { hasOwnProperty } = {};
const { isArray } = Array;


export default Component.extend({
	i18n: service(),

	layout,

	tagName: "div",
	classNames: [ "input-group" ],

	value: "",
	disabled: false,

	placeholder: computed({
		set( key, value ) {
			if ( typeof value === "string" ) {
				return value;
			}

			if ( typeof value !== "object" || !hasOwnProperty.call( value, platform ) ) {
				return get( this, "i18n" ).t( "components.file-select.placeholder" ).toString();
			}

			value = value[ platform ];

			return isArray( value )
				? value[ 0 ]
				: value;
		}
	}),

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
