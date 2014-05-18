define([
	"ember",
	"text!templates/components/infinitescroll.html.hbs"
], function( Ember, Template ) {

	return Ember.Component.extend({
		layout: Ember.Handlebars.compile( Template ),
		tagName: "button",
		classNameBindings: [ ":btn", ":btn-with-icon", ":infinitescroll", "hasFetchedAll:hidden" ],
		attributeBindings: [ "type", "disabled" ],

		type: "button",
		disabled: function() {
			return this.get( "isFetching" ) || this.get( "hasFetchedAll" );
		}.property( "isFetching", "hasFetchedAll" ),

		isFetchingBinding: "targetObject.isFetching",
		hasFetchedAllBinding: "targetObject.hasFetchedAll",

		click: function() {
			this.get( "targetObject" ).send( "willFetchContent", true );
		}
	});

});
