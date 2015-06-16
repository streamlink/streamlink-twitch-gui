define( [ "Ember" ], function( Ember ) {

	return Ember.Component.extend({
		tagName: "input",
		type: "radio",
		attributeBindings: [
			"id", "name", "type", "value", "checked:checked", "disabled", "data-label"
		],

		click: function() {
			if ( this.get( "disabled" ) ) { return; }
			this.set( "selection", this.get( "value" ) );
		},

		checked: function() {
			return this.get( "value" ) === this.get( "selection" );
		}.property( "value", "selection" )
	});

});
