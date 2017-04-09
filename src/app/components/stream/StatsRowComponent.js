import { Component } from "ember";
import layout from "templates/components/stream/StatsRowComponent.hbs";


export default Component.extend({
	layout,

	tagName: "div",
	classNameBindings: [ ":stats-row-component", "class" ],

	withFlag: true
});
