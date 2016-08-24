import { Component } from "Ember";


export default Component.extend({
	tagName: "section",
	classNameBindings: [ ":modal-body", "class" ]
});
