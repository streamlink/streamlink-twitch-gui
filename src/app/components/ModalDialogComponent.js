define([
	"Ember",
	"hbs!templates/components/ModalDialogComponent"
], function(
	Ember,
	layout
) {

	var get = Ember.get;


	return Ember.Component.extend({
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
				get( this, "modal" ).closeModal();
			}
		}
	});

});
