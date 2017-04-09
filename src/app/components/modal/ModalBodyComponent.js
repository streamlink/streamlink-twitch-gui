import { Component } from "ember";


export default Component.extend({
	tagName: "section",
	classNameBindings: [ ":modal-body", "class" ]
});
