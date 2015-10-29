define([
	"Ember",
	"hbs!templates/components/WrapContentComponent.html"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		layout: layout,

		didInitAttrs: function() {
			var tagName = this.attrs.tag;
			this.tagName = typeof tagName === "string"
				? tagName
				: "";
		}
	});

});
