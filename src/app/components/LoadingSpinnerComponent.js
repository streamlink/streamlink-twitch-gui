import { Component } from "Ember";
import layout from "templates/components/LoadingSpinnerComponent.hbs";


export default Component.extend({
	layout,

	tagName: "svg",
	attributeBindings: [ "viewBox" ],
	classNames: [ "loading-spinner-component" ],

	viewBox: "0 0 1 1",

	_setRadiusAttribute: function() {
		var circle = this.element.querySelector( "circle" );
		var strokeWidth = window.getComputedStyle( circle ).strokeWidth;
		var radius = 50 - parseInt( strokeWidth, 10 );
		circle.setAttribute( "r", radius + "%" );
	}.on( "didInsertElement" )
});
