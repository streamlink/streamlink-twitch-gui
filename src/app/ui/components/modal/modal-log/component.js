import Component from "@ember/component";
import { computed, observer } from "@ember/object";
import { on } from "@ember/object/evented";
import { scheduleOnce } from "@ember/runloop";
import layout from "./template.hbs";


export default Component.extend({
	layout,

	tagName: "section",
	classNames: [ "modal-log" ],

	log: computed(function() {
		return [];
	}),

	_logObserver: observer( "log.[]", function() {
		scheduleOnce( "afterRender", () => this.scrollToBottom() );
	}),

	scrollToBottom: on( "didInsertElement", function() {
		const elem = this.element;
		if ( !elem ) { return; }
		elem.scrollTop = Math.max( 0, elem.scrollHeight - elem.clientHeight );
	})
});
