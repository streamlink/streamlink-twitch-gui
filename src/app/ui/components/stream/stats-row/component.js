import Component from "@ember/component";
import layout from "./template.hbs";
import "./styles.less";


export default Component.extend({
	layout,

	tagName: "div",
	classNameBindings: [ ":stats-row-component", "class" ],

	withFlag: true
});
