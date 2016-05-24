define([
	"Ember",
	"hbs!templates/components/form/InputBtnComponent"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		layout: layout,
		tagName: "label",
		classNames: [ "input-btn-component" ],
		classNameBindings: [ "checked", "disabled" ]

	}).reopenClass({
		positionalParams: [ "label" ]
	});

});
