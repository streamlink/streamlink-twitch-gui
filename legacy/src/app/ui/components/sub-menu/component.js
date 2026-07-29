import Component from "@ember/component";
import layout from "./template.hbs";
import "./styles.less";


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
