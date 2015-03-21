define([
	"ember",
	"views/ChannelViewMixin",
	"views/ModalView",
	"text!templates/modals/layouts/livestreamer.html.hbs"
], function( Ember, ChannelViewMixin, ModalView, layout ) {

	return ModalView.extend( ChannelViewMixin, {
		layout: Ember.HTMLBars.compile( layout ),
		classNames: [ "mymodal", "modal-livestreamer" ],

		showStats: Ember.computed.bool( "context.active.success" ),

		stream : Ember.computed.alias( "context.active.stream" ),
		channel: Ember.computed.alias( "context.active.channel" )
	});

});
