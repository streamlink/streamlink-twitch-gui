import Component from "@ember/component";
import layout from "./template.hbs";


export default Component.extend({
	layout,

	tagName: "section",
	classNameBindings: [ ":stream-presentation-component", "class" ],
	"class": "",

	clickablePreview: true
});
