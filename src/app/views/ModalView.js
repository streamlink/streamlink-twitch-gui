define([
	"Ember",
	"text!templates/modals/layouts/default.html.hbs",
	"text!templates/modals/default.html.hbs"
], function( Ember, layout, template ) {

	var get = Ember.get;

	return Ember.View.extend({
		defaultLayout: Ember.HTMLBars.compile( layout ),
		defaultTemplate: Ember.HTMLBars.compile( template ),
		template: null,

		tagName: "section",
		classNames: [ "mymodal" ],

		_isVisible: false,

		head: function() {
			return get( this, "context.modalHead" )
			    || get( this, "context.head" );
		}.property( "context.modalHead", "context.head" ),

		body: function() {
			return get( this, "context.modalBody" )
			    || get( this, "context.body" );
		}.property( "context.modalBody", "context.body" ),


		/*
		 * This will be called synchronously.
		 * Ember doesn't support animations right now.
		 * So we need to use an ugly hack :(
		 */
		willDestroyElement: function() {
			var $this = this.$(),
			    $clone = $this.clone().addClass( "fadeOut" );
			$this.parent().append( $clone );
			$clone.one( "webkitAnimationEnd", function() { $clone.remove(); });
		}
	});

});
