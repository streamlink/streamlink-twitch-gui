import { getOwner } from "@ember/application";
import { get, set, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { translationMacro as t } from "ember-i18n/addon";
import FormButtonComponent from "ui/components/button/form-button/component";


export default FormButtonComponent.extend({
	i18n: service(),
	settings: service(),

	classNames: "btn-neutral",
	classNameBindings: "isHomepage:active",

	title: t( "components.quick-bar-homepage.title" ),

	icon: "fa-home",
	iconanim: true,

	url: computed(function() {
		let router = getOwner( this ).lookup( "router:main" );
		let location = get( router, "location" );

		return location.getURL();
	}).volatile(),

	isHomepage: computed( "url", "settings.gui.homepage", function() {
		return get( this, "url" ) === get( this, "settings.gui.homepage" );
	}),


	action() {
		let settings = get( this, "settings.content" );
		let value    = get( this, "url" );
		if ( !settings || !value ) {
			return Promise.reject();
		}

		set( settings, "gui.homepage", value );
		return settings.save();
	}
});
