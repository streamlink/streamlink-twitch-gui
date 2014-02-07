define([
	"ember",
	"text!templates/components/stream.html.hbs"
], function( Ember, Template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( Template ),
		tagName: "li",
		classNames: [ "list-item list-item-stream" ],
		attributeBindings: [ "title" ],
		title: function() {
			return this.get( "stream.channel.status" );
		}.property( "stream.channel.status" ),

		click: function() {
			this.sendAction( "action", this.get( "stream" ) );
		}
	});

});
