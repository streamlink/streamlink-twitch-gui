define([
	"Ember",
	"views/ModalView",
	"mixins/ChannelViewMixin",
	"text!templates/modals/layouts/livestreamer.html.hbs"
], function(
	Ember,
	ModalView,
	ChannelViewMixin,
	layout
) {

	var alias = Ember.computed.alias;
	var bool = Ember.computed.bool;

	return ModalView.extend( ChannelViewMixin, {
		layout: Ember.HTMLBars.compile( layout ),
		classNames: [ "mymodal", "modal-livestreamer" ],

		showStats: bool( "context.active.success" ),

		stream : alias( "context.active.stream" ),
		channel: alias( "context.active.channel" )
	});

});
