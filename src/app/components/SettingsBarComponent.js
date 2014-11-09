define([
	"ember",
	"text!templates/settingsbar.html.hbs"
], function( Ember, Template ) {

	var	get = Ember.get,
		set = Ember.set;

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( Template ),
		tagName: "div",
		classNameBindings: [ ":settingsbar", "isOpened:opened" ],

		isOpened: false,

		btnHomepage: false,
		btnLayout: false,


		url: function() {
			return get( this, "targetObject.target.location" ).getURL();
		}.property( "targetObject.target.location" ).volatile(),

		isHomepage: function() {
			return get( this, "url" ) === get( this, "controller.homepage" );
		}.property( "url", "controller.homepage" ),

		isLayoutTile: Ember.computed.equal( "controller.layout", "tile" ),
		isLayoutList: Ember.computed.not( "isLayoutTile" ),


		init: function() {
			this._super();

			var controller = this.targetObject.container.lookup( "controller:settingsBar" );
			set( this, "controller", controller );
		},

		didInsertElement: function() {
			this.$( ".btn-open" ).click( this.toggleProperty.bind( this, "isOpened" ) );
		}
	});

});
