define([
	"ember",
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
		classNameBindings: [ "_isVisible:shown" ],

		_isVisible: false,

		head: function() {
			return get( this, "context.modalHead" )
			    || get( this, "context.head" );
		}.property( "context.modalHead", "context.head" ),

		body: function() {
			return get( this, "context.modalBody" )
			    || get( this, "context.body" );
		}.property( "context.modalBody", "context.body" ),


		_willInsertElement: function() {
			this.set( "_isVisible", false );
		}.on( "willInsertElement" ),

		_didInsertElement: function() {
			Ember.run.next( this, function() {
				// add another 20ms delay
				Ember.run.later( this, this.set, "_isVisible", true, 20 );
			});
		}.on( "didInsertElement" ),

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
