import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import { set as setClipboard } from "nwjs/Clipboard";


export default Component.extend({
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

		const nwjs = get( this, "nwjs" );
		nwjs.contextMenu( event, [{
			label: [ "contextmenu.copy-selection" ],
			enabled: selected.length,
			click() {
				setClipboard( selected );
			}
		}] );
	}
});
