import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import Menu from "nwjs/Menu";
import { set as setClipboard } from "nwjs/Clipboard";


export default Component.extend({
	i18n: service(),

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

		const menu = Menu.create();
		menu.items.pushObject({
			label: get( this, "i18n" ).t( "contextmenu.copy-selection" ).toString(),
			enabled: selected.length,
			click() {
				setClipboard( selected );
			}
		});

		menu.popup( event );
	}
});
