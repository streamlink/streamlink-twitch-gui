define([
	"Ember",
	"text!templates/components/infinitescroll.html.hbs"
], function( Ember, template ) {

	var get = Ember.get;
	var alias = Ember.computed.alias;
	var or = Ember.computed.or;

	return Ember.Component.extend({
		layout: Ember.HTMLBars.compile( template ),
		tagName: "button",
		classNameBindings: [ ":btn", ":btn-with-icon", ":infinitescroll", "hasFetchedAll:hidden" ],
		attributeBindings: [ "type", "disabled" ],

		type: "button",
		disabled: or( "isFetching", "hasFetchedAll" ),
		error: alias( "targetObject.fetchError" ),

		isFetching: alias( "targetObject.isFetching" ),
		hasFetchedAll: alias( "targetObject.hasFetchedAll" ),

		click: function() {
			var targetObject = get( this, "targetObject" );
			targetObject.send( "willFetchContent", true );
		}
	});

});
