define([
	"ember",
	"text!templates/components/stream.html.hbs"
], function( Ember, Template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( Template ),
		tagName: "li",
		classNameBindings: [ ":stream-component", "_showGame:show-game" ],

		action: "openLivestreamer",

		showGame: false,
		_showGame: Ember.computed.and( "showGame", "stream.channel.game" ),

		previewError: false,

		willInsertElement: function() {
			this._super.apply( this, arguments );

			this.$( "img" ).one( "error", Ember.set.bind( null, this, "previewError", true ) );
		},

		actions: {
			"startStream": function() {
				this.sendAction( "action", this.get( "stream" ) );
			}
		}
	});

});
