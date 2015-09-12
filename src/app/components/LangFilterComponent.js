define([
	"Ember",
	"text!templates/components/langfilter.html.hbs"
], function( Ember, layout ) {

	var get = Ember.get;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( layout ),
		tagName: "li",

		init: function() {
			this._super.apply( this, arguments );

			var prop = get( this, "prop" );
			var binding = Ember.Binding
				.from( "obj." + prop )
				.to( "checked" );
			binding.connect( this );
		}
	});

});
