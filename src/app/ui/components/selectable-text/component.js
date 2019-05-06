import Component from "@ember/component";
import { inject as service } from "@ember/service";


export default Component.extend({
	/** @type {NwjsService} */
	nwjs: service(),

	tagName: "div",

	classNameBindings: [ "class" ],
	attributeBindings: [ "selectable:data-selectable" ],

	"class"   : "",
	selectable: true,

	contextMenu( event ) {
		if ( this.attrs.noContextmenu ) { return; }

		const selection = window.getSelection();
		const selected = selection.toString();

		if ( !selected.length && event.target.tagName === "A" ) { return; }

		this.nwjs.contextMenu( event, [{
			label: [ "contextmenu.copy-selection" ],
			enabled: selected.length,
			click() {
				this.nwjs.clipboard.set( selected );
			}
		}] );
	}
});
