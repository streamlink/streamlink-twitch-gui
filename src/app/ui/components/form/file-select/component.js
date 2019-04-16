import Component from "@ember/component";
import { set } from "@ember/object";
import { on } from "@ember/object/evented";
import { inject as service } from "@ember/service";
import { translationMacro as t } from "ember-i18n/addon";
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

	_defaultPlaceholder: t( "components.file-select.placeholder" ),
	_placeholder: null,

	get placeholder() {
		return this._placeholder || this._defaultPlaceholder;
	},
	set placeholder( value ) {
		if ( typeof value === "string" ) {
			this._placeholder = value;

		} else if ( typeof value === "object" && hasOwnProperty.call( value, platform ) ) {
			value = value[ platform ];

			this._placeholder = isArray( value )
				? value[ 0 ]
				: value;
		}
	},

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
			if ( !this.disabled ) {
				this._input.dispatchEvent( new MouseEvent( "click", { bubbles: true } ) );
			}
		}
	}
});
