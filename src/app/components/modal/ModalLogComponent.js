import {
	computed,
	run,
	observer,
	on,
	Component
} from "Ember";
import layout from "templates/components/modal/ModalLogComponent.hbs";


const { scheduleOnce } = run;


export default Component.extend({
	layout,

	tagName: "section",
	classNames: [ "modal-log" ],

	log: computed(function() {
		return [];
	}),

	_logObserver: observer( "log.[]", function() {
		scheduleOnce( "afterRender", this, "scrollToBottom" );
	}),

	scrollToBottom: on( "didInsertElement", function() {
		var elem = this.element;
		if ( !elem ) { return; }
		elem.scrollTop = Math.max( 0, elem.scrollHeight - elem.clientHeight );
	})
});
