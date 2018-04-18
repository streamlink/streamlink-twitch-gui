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
	routing: service( "-routing" ),
	settings: service(),
	streaming: service(),

	layout,
	classNames: [ "title-bar-component" ],
	tagName: "header",

	displayName,
	isDebug,

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
