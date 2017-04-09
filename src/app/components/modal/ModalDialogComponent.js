import {
	get,
	inject,
	Component
} from "ember";
import HotkeyMixin from "mixins/HotkeyMixin";
import layout from "templates/components/modal/ModalDialogComponent.hbs";


const { service } = inject;


export default Component.extend( HotkeyMixin, {
	modal: service(),

	layout,

	tagName: "section",
	classNameBindings: [ ":modal-dialog-component", "class" ],

	"class": "",

	hotkeys: [
		{
			code: [ "Escape", "Backspace" ],
			action: "close"
		}
	],

	/*
	 * This will be called synchronously, so we need to copy the element and animate it instead
	 */
	willDestroyElement() {
		const $this = this.$();
		const $clone = $this.clone().addClass( "fadeOut" );
		$this.parent().append( $clone );
		$clone.one( "webkitAnimationEnd", function() { $clone.remove(); });
	},


	actions: {
		close() {
			get( this, "modal" ).closeModal( null, true );
		}
	}
});
