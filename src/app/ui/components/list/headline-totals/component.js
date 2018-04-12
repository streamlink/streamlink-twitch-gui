import Component from "@ember/component";
import { gte } from "@ember/object/computed";
import layout from "./template.hbs";


export default Component.extend({
	layout,

	tagName: "div",
	classNames: [ "total" ],

	total: null,

	isVisible: gte( "total", 0 )

}).reopenClass({
	positionalParams: [ "total" ]
});
