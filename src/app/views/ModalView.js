define([
	"ember",
	"text!templates/modal.html.hbs"
], function( Ember, ModalTemplate ) {

	return Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile( ModalTemplate ),
		tagName: "section",
		classNames: [ "mymodal" ],

		SelectView: Ember.Select.extend({
			classNameBindings: [ "myclass" ]
		}),

		didInsertElement: function() {
			var $this = this.$();
			this._super.apply( this, arguments );
			Ember.run.next( $this, $this.addClass, "shown" );
		},

		/*
		 * This will be called synchronous.
		 * Ember doesn't support animations right now.
		 * So we need to use an ugly hack :(
		 */
		willDestroyElement: function() {
			var	$this	= this.$(),
				$clone	= $this.clone();
			$this.parent().append( $clone );
			$clone.one( "webkitTransitionEnd", function() { $clone.remove(); });
			Ember.run.next( $clone, $clone.removeClass, "shown" );
		}
	});

});
