import Component from "@ember/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { className, classNames, layout, tagName } from "@ember-decorators/component";
import { on } from "@ember-decorators/object";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import { hotkey, hotkeysNamespace } from "utils/decorators";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@tagName( "section" )
@classNames( "modal-dialog-component" )
@hotkeysNamespace( "modaldialog" )
export default class ModalDialogComponent extends Component.extend( HotkeyMixin ) {
	/** @type {ModalService} */
	@service modal;

	@className
	class = "";

	/** @type {string} Set by the modal-service-component on component init */
	modalName = "";
	/** @type {Object} Set by the modal-service-component on component init */
	modalContext = null;

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
	}

	/*
	 * This will be called synchronously, so we need to copy the element and animate it instead
	 */
	@on( "willDestroyElement" )
	_fadeOut() {
		const element = this.element;
		let clone = element.cloneNode( true );
		clone.classList.add( "fadeOut" );
		element.parentNode.appendChild( clone );
		clone.addEventListener( "webkitAnimationEnd", () => {
			clone.parentNode.removeChild( clone );
			clone = null;
		}, { once: true } );
	}


	@hotkey( "close" )
	hotkeyClose() {
		this.send( "close" );
	}


	@action
	close() {
		this.modal.closeModal( this.modalContext, this.modalName );
	}
}
