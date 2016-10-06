import {
	get,
	set,
	computed,
	getOwner,
	inject
} from "Ember";
import FormButtonComponent from "components/button/FormButtonComponent";


const { service } = inject;


export default FormButtonComponent.extend({
	settings: service(),

	"class": computed( "isHomepage", function() {
		let active = get( this, "isHomepage" )
			? " active"
			: "";

		return `btn-neutral${active}`;
	}),

	title: "Set as homepage",

	icon: "fa-home",
	iconanim: true,

	action: "setHomepage",

	url: computed(function() {
		let router = getOwner( this ).lookup( "router:main" );
		let location = get( router, "location" );

		return location.getURL();
	}).volatile(),

	isHomepage: computed( "url", "settings.gui_homepage", function() {
		return get( this, "url" ) === get( this, "settings.gui_homepage" );
	}),


	actions: {
		setHomepage( success, failure ) {
			var settings = get( this, "settings.content" );
			var value    = get( this, "url" );
			if ( !settings || !value ) {
				return failure();
			}

			set( settings, "gui_homepage", value );
			settings.save()
				.then( success, failure )
				.catch();
		}
	}
});
