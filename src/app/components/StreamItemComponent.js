define([
	"ember",
	"text!templates/components/stream.html.hbs"
], function( Ember, Template ) {

	return Ember.Component.extend({
		template: Ember.Handlebars.compile( Template ),
		tagName: "li",
		classNames: [ "list-item list-item-stream" ],

		click: function() {
			require( "child_process" ).spawn( "livestreamer", [
				this.stream.channel.url,
				"best,high,mobile_high,medium"
			]);
		}
	});

});
