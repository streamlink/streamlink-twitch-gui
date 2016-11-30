import { Component } from "Ember";
import layout from "templates/components/MainMenuComponent.hbs";


export default Component.extend({
	layout,

	classNames: [ "main-menu-component" ],
	tagName: "aside"
});
