define([
	"ember",
	"mixins/PreviewImageViewMixin",
	"moment",
	"text!templates/components/subscription.html.hbs"
], function( Ember, PreviewImageViewMixin, moment, template ) {

	var get = Ember.get;

	return Ember.Component.extend( PreviewImageViewMixin, {
		metadata: Ember.inject.service(),

		layout: Ember.HTMLBars.compile( template ),
		tagName: "li",
		classNameBindings: [ ":subscription-component" ],
		attributeBindings: [ "style" ],

		product  : Ember.computed.alias( "subscription.product" ),
		channel  : Ember.computed.alias( "product.partner_login" ),
		emoticons: Ember.computed.alias( "product.emoticons" ),

		style: function() {
			var banner = get( this, "channel.profile_banner" );
			return "background-image:url(\"%@\")".fmt( banner ).htmlSafe();
		}.property( "channel.profile_banner" ),

		hasEnded: function() {
			var access_end = get( this, "subscription.access_end" );
			return new Date() > access_end;
		}.property( "subscription.access_end" ),

		ends: function() {
			var access_end = get( this, "subscription.access_end" );
			return moment().to( access_end );
		}.property( "subscription.access_end" ).volatile(),


		buttonAction: "openBrowser",
		openBrowser: function( url ) {
			var channel = get( this, "channel.id" );
			this.sendAction( "buttonAction", url.replace( "{channel}", channel ) );
		},


		actions: {
			edit: function() {
				var url = get( this, "metadata.config.twitch-subscribe-edit" );
				this.openBrowser( url );
			},

			cancel: function() {
				var url = get( this, "metadata.config.twitch-subscribe-cancel" );
				this.openBrowser( url );
			}
		}
	});

});
