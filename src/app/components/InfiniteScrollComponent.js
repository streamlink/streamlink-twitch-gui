define([
	"Ember",
	"text!templates/components/infinitescroll.html.hbs"
], function( Ember, template ) {

	var get = Ember.get;

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
			var targetObject = get( this, "targetObject" );
			targetObject.send( "willFetchContent", true );
		}
	});

});
