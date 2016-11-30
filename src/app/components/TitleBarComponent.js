import {
	get,
	inject,
	Component
} from "Ember";
import layout from "templates/components/TitleBarComponent.hbs";


const { service } = inject;


export default Component.extend({
	auth: service(),
	notification: service(),
	nwjs: service(),
	routing: service( "-routing" ),
	settings: service(),
	streaming: service(),

	layout,
	classNames: [ "title-bar-component" ],
	tagName: "header",

	dev: DEBUG,

	nl: "\n",


	actions: {
		goto() {
			get( this, "routing" ).transitionTo( ...arguments );
		},

		homepage() {
			get( this, "routing" ).homepage();
		},

		nwjs( method ) {
			get( this, "nwjs" )[ method ]();
		}
	}
});
