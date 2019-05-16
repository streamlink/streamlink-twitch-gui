import { A } from "@ember/array";
import Component from "@ember/component";
import { classNames, layout, tagName } from "@ember-decorators/component";
import { observes, on } from "@ember-decorators/object";
import { scheduleOnce } from "@ember/runloop";
import template from "./template.hbs";


@layout( template )
@tagName( "section" )
@classNames( "modal-log-component" )
export default class ModalLogComponent extends Component {
	log = A();

	@observes( "log.[]" )
	_logObserver() {
		scheduleOnce( "afterRender", () => this.scrollToBottom() );
	}

	@on( "didInsertElement" )
	scrollToBottom() {
		const elem = this.element;
		if ( !elem ) { return; }
		elem.scrollTop = Math.max( 0, elem.scrollHeight - elem.clientHeight );
	}
}
