define([
	"ember",
	"text!templates/modal.html.hbs",
	"text!templates/modals/default.html.hbs"
], function( Ember, layout, template ) {

	return Ember.View.extend({
		defaultLayout: Ember.Handlebars.compile( layout ),
		defaultTemplate: Ember.Handlebars.compile( template ),
		template: null,

		tagName: "section",
		classNames: [ "mymodal" ],

		head: function() {
			return this.get( "context.modalHead" )
			    || this.get( "context.head" );
		}.property( "context.modalHead", "context.head" ),

		body: function() {
			return this.get( "context.modalBody" )
			    || this.get( "context.body" );
		}.property( "context.modalBody", "context.body" ),


		didInsertElement: function() {
			var $this = this.$().removeClass( "shown" );
			this._super.apply( this, arguments );
			Ember.run.next( $this, $this.addClass, "shown" );
		},

		/*
		 * This will be called synchronously.
		 * Ember doesn't support animations right now.
		 * So we need to use an ugly hack :(
		 */
		willDestroyElement: function() {
			var $this = this.$(),
			    $clone = $this.clone();
			$this.parent().append( $clone );
			$clone.one( "webkitTransitionEnd", function() { $clone.remove(); });
			Ember.run.next( $clone, $clone.removeClass, "shown" );
		}
	});

});
