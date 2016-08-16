define([
	"Ember",
	"templates/components/list/HeadlineTotalsComponent.hbs"
], function(
	Ember,
	layout
) {

	var gte = Ember.computed.gte;


	return Ember.Component.extend({
		layout: layout,

		tagName: "div",
		classNames: [ "total" ],

		total: null,

		isVisible: gte( "total", 0 )
	});

});
