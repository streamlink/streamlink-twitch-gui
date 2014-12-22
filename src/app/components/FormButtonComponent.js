define([
	"ember",
	"text!templates/components/formbutton.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( template ),
		tagName: "button",
		attributeBindings: [ "type" ],
		type: "button",
		classNameBindings: [ ":btn", "icon:btn-with-icon", "class" ],

		action: "",
		class: "",
		icon: false,

		click: function() {
			this.sendAction();
		}
	});

});
