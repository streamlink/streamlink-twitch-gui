import Component from "@ember/component";
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

	/** @type {string} Set by the modal-service-component on component init */
	modalName: "",
	/** @type {Object} Set by the modal-service-component on component init */
	modalContext: null,

	/*
	 * Since Ember will try to re-use the same DOM element when only the modalContext changes and
	 * the modalName stays the same (see modal-server-component), the open/close animation
	 * won't play here. Simply re-insert the DOM node on modalContext change to fix this.
	 */
	didInsertElement() {
		this._super( ...arguments );
		this.addObserver( "modalContext", this, () => {
			const { element } = this;
			element.parentNode.replaceChild( element, element );
		});
	},

	/*
	 * This will be called synchronously, so we need to copy the element and animate it instead
	 */
	willDestroyElement() {
		const { element } = this;
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
			this.modal.closeModal( this.modalContext, this.modalName );
		}
	}
});
