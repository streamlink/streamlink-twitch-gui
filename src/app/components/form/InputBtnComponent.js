import { Component } from "ember";
import layout from "templates/components/form/InputBtnComponent.hbs";


export default Component.extend({
	layout,

	tagName: "label",
	classNames: [ "input-btn-component" ],
	classNameBindings: [ "checked", "disabled" ]

}).reopenClass({
	positionalParams: [ "label" ]
});
