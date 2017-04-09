import {
	inject,
	Component
} from "ember";


const { service } = inject;


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
