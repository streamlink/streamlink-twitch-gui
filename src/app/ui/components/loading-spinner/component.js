import Component from "@ember/component";
import { on } from "@ember/object/evented";
import layout from "./template.hbs";
import "./styles.less";


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
