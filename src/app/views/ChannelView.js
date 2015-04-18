define([
	"ember",
	"text!templates/channel/channel.html.hbs"
], function( Ember, template ) {

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-channel" ],

		actions: {
			"toggleSettings": function() {
				this.element.classList.add( "animated" );
				this.get( "controller" ).send( "toggleSettings" );
			}
		}
	});

});
