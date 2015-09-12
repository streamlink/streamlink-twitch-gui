define([
	"Ember",
	"hbs!templates/components/modaldialog.html"
], function(
	Ember,
	layout
) {

	var or = Ember.computed.or;

	return Ember.Component.extend({
		layout: layout,

		tagName: "section",
		classNameBindings: [ ":mymodal", "class" ],

		head: or( "context.modalHead", "context.head" ),
		body: or( "context.modalBody", "context.body" ),

		/*
		 * This will be called synchronously, so we need to copy the element and animate it instead
		 */
		willDestroyElement: function() {
			var $this  = this.$();
			var $clone = $this.clone().addClass( "fadeOut" );
			$this.parent().append( $clone );
			$clone.one( "webkitAnimationEnd", function() { $clone.remove(); });
		}
	});

});
