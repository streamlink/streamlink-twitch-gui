import Component from "@ember/component";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import layout from "./template.hbs";
import "./styles.less";


export default Component.extend( HotkeyMixin, {
	modal: service(),

	layout,

	tagName: "section",
	classNameBindings: [ ":modal-dialog-component", "class" ],

	"class": "",

	hotkeysNamespace: "modaldialog",
	hotkeys: {
		close: "close"
	},

	/*
	 * This will be called synchronously, so we need to copy the element and animate it instead
	 */
	willDestroyElement() {
		const element = this.element;
		let clone = element.cloneNode( true );
		clone.classList.add( "fadeOut" );
		element.parentNode.appendChild( clone );
		clone.addEventListener( "webkitAnimationEnd", () => {
			clone.parentNode.removeChild( clone );
			clone = null;
		}, { once: true } );
	},


	actions: {
		close() {
			get( this, "modal" ).closeModal( null, true );
		}
	}
});
