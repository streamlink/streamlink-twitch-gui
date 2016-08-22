import Ember from "Ember";
import layout from "templates/components/stream/StreamPresentationComponent.hbs";


export default Ember.Component.extend({
	layout,

	tagName: "section",
	classNameBindings: [ ":stream-presentation-component", "class" ],
	"class": "",

	clickablePreview: true
});
