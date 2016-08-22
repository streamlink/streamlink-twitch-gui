import Ember from "Ember";


	export default Ember.Component.extend({
		tagName: "section",
		classNameBindings: [ ":modal-body", "class" ]
	});
