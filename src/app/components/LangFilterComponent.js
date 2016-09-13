import {
	get,
	defineProperty,
	computed,
	observer,
	Component
} from "Ember";
import layout from "templates/components/LangFilterComponent.hbs";


const { alias } = computed;


export default Component.extend({
	layout,

	tagName: "li",

	_checkedObserver: observer( "prop", function() {
		let prop = get( this, "prop" );
		let path = `obj.${prop}`;

		defineProperty( this, "checked", alias( path ) );
	}).on( "init" )
});
