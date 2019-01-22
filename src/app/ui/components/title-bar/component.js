import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import { main as mainConfig } from "config";
import { isDebug } from "nwjs/debug";
import layout from "./template.hbs";
import "./styles.less";


const { "display-name": displayName } = mainConfig;


export default Component.extend({
	auth: service(),
	notification: service(),
	nwjs: service(),
	/** @type {RouterService} */
	router: service(),
	settings: service(),
	streaming: service(),

	layout,
	classNames: [ "title-bar-component" ],
	tagName: "header",

	displayName,
	isDebug,

	actions: {
		goto() {
			this.router.transitionTo( ...arguments );
		},

		homepage() {
			this.router.homepage();
		},

		nwjs( method ) {
			get( this, "nwjs" )[ method ]();
		}
	}
});
