define( [ "ember" ], function( Ember ) {

	return Ember.Component.extend({
		tagName: "input",
		type: "radio",
		attributeBindings: [ "id", "name", "type", "value", "checked:checked", "data-label" ],

		click: function() {
			this.set( "selection", this.get( "value" ) );
		},

		checked: function() {
			return this.get( "value" ) === this.get( "selection" );
		}.property( "selection" )
	});

});
