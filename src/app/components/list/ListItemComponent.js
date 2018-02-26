import Component from "@ember/component";
import { inject as service } from "@ember/service";


export default Component.extend({
	settings: service(),

	tagName: "li",
	classNameBindings: [
		"isNewItem:newItem",
		"isDuplicateItem:duplicateItem"
	],

	isNewItem: false,
	isDuplicateItem: false
});
