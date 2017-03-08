import {
	get,
	inject,
	run,
	on,
	Component
} from "Ember";
import Masonry from "Masonry";
import layout from "templates/components/channel/ChannelPanelsComponent.hbs";


const { service } = inject;
const { scheduleOnce } = run;


export default Component.extend({
	routing: service( "-routing" ),

	layout,

	tagName: "section",
	classNames: [
		"channel-panels-component"
	],

	_masonry: on( "didInsertElement", function() {
		var container = this.$( "ul" )[0];
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
