define([
	"Ember",
	"text!templates/channel/channel.html.hbs"
], function( Ember, template ) {

	var get = Ember.get;

	return Ember.View.extend({
		template: Ember.HTMLBars.compile( template ),
		tagName: "main",
		classNames: [ "content", "content-channel" ],

		actions: {
			"toggleSettings": function() {
				this.element.classList.add( "animated" );
				get( this, "controller" ).send( "toggleSettings" );
			}
		}
	});

});
