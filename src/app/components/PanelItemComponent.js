define([
	"Ember",
	"hbs!templates/components/PanelItemComponent"
], function(
	Ember,
	layout
) {

	return Ember.Component.extend({
		layout: layout,
		tagName: "li",
		classNames: [ "panel-item-component" ],

		didInsertElement: function() {
			var self = this;

			this.$( "a" ).addClass( "external-link" ).click(function( e ) {
				e.preventDefault();
				e.stopImmediatePropagation();
				self.send( "openBrowser", this.href );
			});

			this._super.apply( this, arguments );
		},

		action: "openBrowser",

		actions: {
			"openBrowser": function( url ) {
				this.sendAction( "action", url );
			}
		}
	});

});
