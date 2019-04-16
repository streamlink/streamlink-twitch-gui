import { set } from "@ember/object";
import { equal } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { translationMacro as t } from "ember-i18n/addon";
import FormButtonComponent from "ui/components/button/form-button/component";


export default FormButtonComponent.extend({
	i18n: service(),
	router: service(),
	settings: service(),

	classNames: "btn-neutral",
	classNameBindings: "isHomepage:active",

	title: t( "components.quick-bar-homepage.title" ),

	icon: "fa-home",
	iconanim: true,

	isHomepage: equal( "router.currentURL", "settings.content.gui.homepage" ),


	action() {
		/** @type {Settings} */
		const settings = this.settings.content;
		const value = this.router.currentURL;
		set( settings, "gui.homepage", value );

		return settings.save();
	}
});
