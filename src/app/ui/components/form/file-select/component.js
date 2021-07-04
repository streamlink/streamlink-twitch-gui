import Component from "@ember/component";
import { get, set, computed } from "@ember/object";
import { on } from "@ember/object/evented";
import { inject as service } from "@ember/service";
import { platform } from "utils/node/platform";
import layout from "./template.hbs";


const { hasOwnProperty } = {};
const { isArray } = Array;


export default Component.extend({
	/** @type {IntlService} */
	intl: service(),

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
				return this.intl.t( "components.file-select.placeholder" ).toString();
			}

			value = value[ platform ];

			return isArray( value )
				? value[ 0 ]
				: value;
		}
	}),

	_createInput: on( "didInsertElement", function() {
		const input = this.element.ownerDocument.createElement( "input" );
		input.classList.add( "hidden" );
		input.setAttribute( "type", "file" );
		input.setAttribute( "tabindex", "-1" );
		input.addEventListener( "change", () => {
			if ( !input.value.length ) { return; }
			set( this, "value", input.value );
			input.files.clear();
		});
		this._input = input;
	}),

	actions: {
		selectfile() {
			if ( !get( this, "disabled" ) ) {
				this._input.dispatchEvent( new MouseEvent( "click", { bubbles: true } ) );
			}
		}
	}
});
