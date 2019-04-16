import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import { translationMacro as t } from "ember-i18n/addon";
import layout from "./template.hbs";


export default Component.extend({
	i18n: service(),

	layout,

	tagName: "div",
	classNames: [ "drop-down-selection-component" ],
	classNameBindings: [ "class" ],

	_defaultPlaceholder: t( "components.drop-down-selection.placeholder" ),
	_placeholder: null,

	get placeholder() {
		return this._placeholder || this._defaultPlaceholder;
	},
	set placeholder( value ) {
		this._placeholder = value;
	},

	click() {
		get( this, "action" )();
		return false;
	}
});
