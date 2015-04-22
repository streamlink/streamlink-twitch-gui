define([
	"ember",
	"views/PreviewImageViewMixin",
	"text!templates/channel/channel.html.hbs"
], function( Ember, PreviewImageViewMixin, template ) {

	return Ember.View.extend( PreviewImageViewMixin, {
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
