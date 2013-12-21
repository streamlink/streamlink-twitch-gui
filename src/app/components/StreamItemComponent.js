define([
	"ember",
	"text!templates/components/stream.html.hbs"
], function( Ember, Template ) {

	return Ember.Component.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "li",
		classNames: [ "list-item list-item-stream" ],

		click: function() {
			this.sendAction( "action", this.get( "stream" ) );
		}
	});

});
