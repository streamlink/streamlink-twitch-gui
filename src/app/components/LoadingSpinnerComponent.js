import {
	on,
	Component
} from "ember";
import layout from "templates/components/LoadingSpinnerComponent.hbs";


export default Component.extend({
	layout,

	tagName: "svg",
	attributeBindings: [ "viewBox" ],
	classNames: [ "loading-spinner-component" ],

	viewBox: "0 0 1 1",

	_setRadiusAttribute: on( "didInsertElement", function() {
		let circle = this.element.querySelector( "circle" );
		let strokeWidth = window.getComputedStyle( circle ).strokeWidth;
		let radius = 50 - parseFloat( strokeWidth );
		circle.setAttribute( "r", `${radius}%` );
	})
});
