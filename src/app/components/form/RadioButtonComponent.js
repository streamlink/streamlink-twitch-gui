define([
	"Ember"
], function(
	Ember
) {

	var get = Ember.get;
	var set = Ember.set;


	return Ember.Component.extend({
		tagName: "input",
		attributeBindings: [
			"id", "name", "type", "value", "checked", "disabled"
		],
		type: "radio",

		checked: function() {
			return get( this, "value" ) === get( this, "selection" );
		}.property( "value", "selection" ),

		click: function() {
			if ( get( this, "disabled" ) ) { return; }
			var value = get( this, "value" );
			set( this, "selection", value );
		}
	});

});
