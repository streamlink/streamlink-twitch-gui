define([
	"Ember",
	"hbs!templates/components/loadingspinner.html"
], function(
	Ember,
	layout
) {

	// circle radius can't be set in css
	// set it dynamically by reading the stroke-width from the css style rules

	var CSSStyleRule = window.CSSStyleRule;
	var rule = [].filter.call( document.styleSheets[0].rules, function( rule ) {
		return rule instanceof CSSStyleRule
		    && rule.selectorText === ".loading-spinner > circle";
	})[0];
	var width  = rule && parseInt( rule.style.strokeWidth ) || 5;
	var radius = ( 50 - width ) + "%";


	return Ember.Component.extend({
		layout: layout,

		tagName: "svg",
		attributeBindings: [ "viewBox" ],
		classNames: [ "loading-spinner" ],

		viewBox: "0 0 1 1",

		_setRadiusAttribute: function() {
			this.element.querySelector( "circle" ).setAttribute( "r", radius );
		}.on( "willInsertElement" )
	});

});
