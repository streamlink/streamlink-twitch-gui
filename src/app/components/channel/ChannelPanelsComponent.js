define([
	"Ember",
	"Masonry",
	"templates/components/channel/ChannelPanelsComponent.hbs"
], function(
	Ember,
	Masonry,
	layout
) {

	var run = Ember.run;
	var scheduleOnce = run.scheduleOnce;


	return Ember.Component.extend({
		layout: layout,
		tagName: "section",
		classNames: [ "content", "content-panels" ],

		action: "openBrowser",

		_masonry: function() {
			var container = this.$( "ul" )[0];
			scheduleOnce( "afterRender", function() {
				return new Masonry( container, {
					itemSelector: ".channel-panel-item-component",
					columnWidth: ".channel-panel-item-component",
					transitionDuration: 0
				});
			});
		}.on( "didInsertElement" ),

		actions: {
			openBrowser: function( url ) {
				this.sendAction( "action", url );
			}
		}
	});

});
