define([
	"Ember",
	"components/form/InputBtnComponent"
], function(
	Ember,
	InputBtnComponent
) {

	var get = Ember.get;


	return InputBtnComponent.extend({
		classNames: [ "radio-btn-component" ],

		click: function() {
			if ( get( this, "disabled" ) ) { return; }
			// notify RadioBtnsComponent that the current RadioBtnComponent is the selection now
			get( this, "onClick" )( this );
		}
	});

});
