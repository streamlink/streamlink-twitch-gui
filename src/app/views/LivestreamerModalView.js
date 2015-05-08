define([
	"ember",
	"views/ModalView",
	"mixins/ChannelViewMixin",
	"text!templates/modals/layouts/livestreamer.html.hbs"
], function(
	Ember,
	ModalView,
	ChannelViewMixin,
	layout
) {

	return ModalView.extend( ChannelViewMixin, {
		layout: Ember.HTMLBars.compile( layout ),
		classNames: [ "mymodal", "modal-livestreamer" ],

		showStats: Ember.computed.bool( "context.active.success" ),

		stream : Ember.computed.alias( "context.active.stream" ),
		channel: Ember.computed.alias( "context.active.channel" )
	});

});
