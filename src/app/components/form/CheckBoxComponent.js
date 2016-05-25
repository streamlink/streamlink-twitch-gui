define([
	"Ember",
	"components/form/InputBtnComponent"
], function(
	Ember,
	InputBtnComponent
) {

	var get = Ember.get;


	return InputBtnComponent.extend({
		classNames: [ "check-box-component" ],

		click: function() {
			if ( get( this, "disabled" ) ) { return; }
			this.toggleProperty( "checked" );
		}
	});

});
