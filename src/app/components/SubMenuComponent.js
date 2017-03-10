import {
	Component
} from "Ember";
import layout from "templates/components/SubMenuComponent.hbs";


export default Component.extend({
	layout,

	tagName: "ul",
	classNames: [
		"sub-menu-component"
	],

	baseroute: null,
	menus: null

}).reopenClass({
	positionalParams: [
		"baseroute",
		"menus"
	]
});
