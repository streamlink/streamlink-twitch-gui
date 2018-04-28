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

	placeholder: t( "components.drop-down-selection.placeholder" ),

	click() {
		get( this, "action" )();
		return false;
	}
});
