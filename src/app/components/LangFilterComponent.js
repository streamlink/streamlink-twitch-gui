define([
	"Ember",
	"hbs!templates/components/LangFilterComponent.html"
], function(
	Ember,
	layout
) {

	var get = Ember.get;

	return Ember.Component.extend({
		layout: layout,
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
