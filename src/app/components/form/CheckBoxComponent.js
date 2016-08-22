import Ember from "Ember";
import InputBtnComponent from "components/form/InputBtnComponent";


	var get = Ember.get;


	export default InputBtnComponent.extend({
		classNames: [ "check-box-component" ],

		click: function() {
			if ( get( this, "disabled" ) ) { return; }
			this.toggleProperty( "checked" );
		}
	});
