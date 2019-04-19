import Component from "@ember/component";
import { set, action } from "@ember/object";
import { inject as service } from "@ember/service";
import { classNames, layout, tagName } from "@ember-decorators/component";
import { on } from "@ember-decorators/object";
import { t } from "ember-i18n/decorator";
import { platform } from "utils/node/platform";
import template from "./template.hbs";


const { hasOwnProperty } = {};
const { isArray } = Array;


@layout( template )
@tagName( "div" )
@classNames( "file-select-component", "input-group" )
export default class FileSelectComponent extends Component {
	/** {I18nService} */
	@service i18n;

	value = "";
	disabled = false;

	/** @type {HTMLInputElement} */
	_input = null;

	@t( "components.file-select.placeholder" )
	_defaultPlaceholder;

	_placeholder = null;

	get placeholder() {
		return this._placeholder || this._defaultPlaceholder;
	}
	set placeholder( value ) {
		if ( typeof value === "string" ) {
			this._placeholder = value;

		} else if ( typeof value === "object" && hasOwnProperty.call( value, platform ) ) {
			value = value[ platform ];

			this._placeholder = isArray( value )
				? value[ 0 ]
				: value;
		}
	}


	@on( "didInsertElement" )
	_createInputElement() {
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
	}

	@on( "willDestroyElement" )
	_destroyInputElement() {
		this._input = null;
	}


	@action
	selectfile() {
		if ( !this.disabled ) {
			this._input.dispatchEvent( new MouseEvent( "click", { bubbles: true } ) );
		}
	}
}
