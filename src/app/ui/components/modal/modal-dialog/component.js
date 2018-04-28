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
