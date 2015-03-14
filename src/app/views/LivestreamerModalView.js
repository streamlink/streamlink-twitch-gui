define([
	"ember",
	"views/ChannelViewMixin",
	"views/ModalView"
], function( Ember, ChannelViewMixin, ModalView ) {

	return ModalView.extend( ChannelViewMixin, {
		classNames: [ "mymodal", "modal-livestreamer" ],

		channel: Ember.computed.alias( "context.active.channel" )
	});

});
