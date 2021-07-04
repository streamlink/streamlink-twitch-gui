import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import { t } from "ember-intl";
import layout from "./template.hbs";


export default Component.extend({
	/** @type {IntlService} */
	intl: service(),

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
