import Ember from "Ember";
import layout from "templates/components/list/HeadlineTotalsComponent.hbs";


	var gte = Ember.computed.gte;


	export default Ember.Component.extend({
		layout: layout,

		tagName: "div",
		classNames: [ "total" ],

		total: null,

		isVisible: gte( "total", 0 )
	});
