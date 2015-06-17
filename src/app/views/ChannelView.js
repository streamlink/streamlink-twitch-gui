define([
	"Ember",
	"mixins/PreviewImageViewMixin",
	"text!templates/channel/channel.html.hbs"
], function( Ember, PreviewImageViewMixin, template ) {

	var get = Ember.get;

	return Ember.View.extend( PreviewImageViewMixin, {
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
