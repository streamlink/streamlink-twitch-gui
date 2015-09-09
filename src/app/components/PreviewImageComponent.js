define([
	"Ember",
	"text!templates/components/previewimage.html.hbs"
], function(
	Ember,
	layout
) {

	var set = Ember.set;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( layout ),

		classNames: [],
		error: false,

		checkError: function() {
			var self = this;
			this.$( "img" ).one( "error", function() {
				set( self, "error", true );
			});
		}.on( "willInsertElement" )
	});

});
