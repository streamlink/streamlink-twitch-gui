import Component from "@ember/component";


export default Component.extend({
	tagName: "section",
	classNameBindings: [ ":modal-body", "class" ]
});
