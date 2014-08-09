define([
	"ember",
	"text!templates/components/stream.html.hbs"
], function( Ember, Template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( Template ),
		tagName: "li",
		classNames: [ "stream-component" ],
		attributeBindings: [ "title" ],
		titleBinding: "stream.channel.status",

		action: "openLivestreamer",

		click: function() {
			this.sendAction( "action", this.get( "stream" ) );
		}
	});

});
