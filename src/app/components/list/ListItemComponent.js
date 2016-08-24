import Ember from "Ember";


export default Ember.Component.extend({
	settings: Ember.inject.service(),

	tagName: "li",
	classNameBindings: [
		"isNewItem:newItem",
		"isDuplicateItem:duplicateItem"
	],

	isNewItem: false,
	isDuplicateItem: false
});
