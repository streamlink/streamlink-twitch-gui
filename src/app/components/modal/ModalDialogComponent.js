import Ember from "Ember";
import layout from "templates/components/modal/ModalDialogComponent.hbs";


	var get = Ember.get;


	export default Ember.Component.extend({
		modal: Ember.inject.service(),

		layout: layout,

		tagName: "section",
		classNameBindings: [ ":modal-dialog-component", "class" ],

		"class": "",

		/*
		 * This will be called synchronously, so we need to copy the element and animate it instead
		 */
		willDestroyElement: function() {
			var $this  = this.$();
			var $clone = $this.clone().addClass( "fadeOut" );
			$this.parent().append( $clone );
			$clone.one( "webkitAnimationEnd", function() { $clone.remove(); });
		},


		actions: {
			"close": function() {
				get( this, "modal" ).closeModal( null, true );
			}
		}
	});
