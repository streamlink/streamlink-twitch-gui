import {
	get,
	inject,
	Component
} from "Ember";
import layout from "templates/components/modal/ModalDialogComponent.hbs";


const { service } = inject;


export default Component.extend({
	modal: service(),

	layout,

	tagName: "section",
	classNameBindings: [ ":modal-dialog-component", "class" ],

	"class": "",

	/*
	 * This will be called synchronously, so we need to copy the element and animate it instead
	 */
	willDestroyElement() {
		var $this  = this.$();
		var $clone = $this.clone().addClass( "fadeOut" );
		$this.parent().append( $clone );
		$clone.one( "webkitAnimationEnd", function() { $clone.remove(); });
	},


	actions: {
		close() {
			get( this, "modal" ).closeModal( null, true );
		}
	}
});
