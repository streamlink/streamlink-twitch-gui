define([
	"Ember",
	"hbs!templates/components/PreviewImageComponent.html"
], function(
	Ember,
	layout
) {

	var set = Ember.set;

	return Ember.Component.extend({
		layout: layout,

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
