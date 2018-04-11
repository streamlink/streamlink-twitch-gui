import Component from "@ember/component";
import layout from "./template.hbs";


export default Component.extend({
	layout,

	tagName: "div",
	classNameBindings: [ ":stats-row-component", "class" ],

	withFlag: true
});
