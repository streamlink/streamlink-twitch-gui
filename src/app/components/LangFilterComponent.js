import Ember from "Ember";
import layout from "templates/components/LangFilterComponent.hbs";


	var get = Ember.get;


	export default Ember.Component.extend({
		layout: layout,
		tagName: "li",

		init: function() {
			this._super.apply( this, arguments );

			var prop = get( this, "prop" );
			var binding = Ember.Binding
				.from( "obj." + prop )
				.to( "checked" );
			binding.connect( this );
		}
	});
