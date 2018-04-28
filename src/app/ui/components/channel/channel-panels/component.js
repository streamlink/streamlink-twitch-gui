import Component from "@ember/component";
import { get } from "@ember/object";
import { on } from "@ember/object/evented";
import { scheduleOnce } from "@ember/runloop";
import { inject as service } from "@ember/service";
import Masonry from "masonry-layout";
import layout from "./template.hbs";


export default Component.extend({
	routing: service( "-routing" ),

	layout,

	tagName: "section",
	classNames: [
		"channel-panels-component"
	],

	_masonry: on( "didInsertElement", function() {
		const container = this.$( "ul" )[ 0 ];
		scheduleOnce( "afterRender", function() {
			return new Masonry( container, {
				itemSelector: ".channel-panel-item-component",
				columnWidth: ".channel-panel-item-component",
				transitionDuration: 0
			});
		});
	}),

	actions: {
		openBrowser( url ) {
			get( this, "routing" ).openBrowserOrTransitionToChannel( url );
		}
	}
});
