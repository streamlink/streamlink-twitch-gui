define([
	"Ember",
	"components/ListItemComponent",
	"Moment",
	"text!templates/components/subscription.html.hbs"
], function(
	Ember,
	ListItemComponent,
	Moment,
	layout
) {

	var get = Ember.get;
	var alias = Ember.computed.alias;

	return ListItemComponent.extend({
		metadata: Ember.inject.service(),

		layout: Ember.HTMLBars.compile( layout ),
		classNames: [ "subscription-component" ],
		attributeBindings: [ "style" ],

		product  : alias( "content.product" ),
		channel  : alias( "product.partner_login" ),
		emoticons: alias( "product.emoticons" ),

		style: function() {
			var banner =  get( this, "channel.profile_banner" )
			           || get( this, "channel.video_banner" )
			           || "";
			return "background-image:url(\"%@\")".fmt( banner ).htmlSafe();
		}.property( "channel.profile_banner", "channel.video_banner" ),

		hasEnded: function() {
			var access_end = get( this, "content.access_end" );
			return new Date() > access_end;
		}.property( "content.access_end" ).volatile(),

		ends: function() {
			var access_end = get( this, "content.access_end" );
			return new Moment().to( access_end );
		}.property( "content.access_end" ).volatile(),


		buttonAction: "openBrowser",
		openBrowser: function( url ) {
			var channel = get( this, "channel.id" );
			this.sendAction( "buttonAction", url.replace( "{channel}", channel ) );
		},


		actions: {
			edit: function( success ) {
				var url = get( this, "metadata.config.twitch-subscribe-edit" );
				this.openBrowser( url );
				if ( success instanceof Function ) {
					success();
				}
			},

			cancel: function( success ) {
				var url = get( this, "metadata.config.twitch-subscribe-cancel" );
				this.openBrowser( url );
				if ( success instanceof Function ) {
					success();
				}
			}
		}
	});

});
