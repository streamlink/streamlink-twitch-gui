import { Component } from "ember";
import layout from "templates/components/stream/StreamPresentationComponent.hbs";


export default Component.extend({
	layout,

	tagName: "section",
	classNameBindings: [ ":stream-presentation-component", "class" ],
	"class": "",

	clickablePreview: true
});
