define([
	"ember",
	"text!templates/components/infinitescroll.html.hbs"
], function( Ember, template ) {

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( template ),
		tagName: "button",
		classNameBindings: [ ":btn", ":btn-with-icon", ":infinitescroll", "hasFetchedAll:hidden" ],
		attributeBindings: [ "type", "disabled" ],

		type: "button",
		disabled: Ember.computed.or( "isFetching", "hasFetchedAll" ),
		errorBinding: "targetObject.fetchError",

		isFetchingBinding: "targetObject.isFetching",
		hasFetchedAllBinding: "targetObject.hasFetchedAll",

		click: function() {
			this.get( "targetObject" ).send( "willFetchContent", true );
		}
	});

});
