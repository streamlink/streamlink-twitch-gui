define([
	"ember",
	"text!templates/modal.html.hbs"
], function( Ember, ModalTemplate ) {

	return Ember.View.extend({
		defaultTemplate: Ember.Handlebars.compile( ModalTemplate ),
		tagName: "section",
		classNames: [ "mymodal" ]
	});

});
