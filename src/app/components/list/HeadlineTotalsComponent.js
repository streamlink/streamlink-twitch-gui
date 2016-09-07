import {
	computed,
	Component
} from "Ember";
import layout from "templates/components/list/HeadlineTotalsComponent.hbs";


const { gte } = computed;


export default Component.extend({
	layout,

	tagName: "div",
	classNames: [ "total" ],

	total: null,

	isVisible: gte( "total", 0 )
});
