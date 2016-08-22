import Ember from "Ember";
import layout from "templates/components/form/InputBtnComponent.hbs";


export default Ember.Component.extend({
	layout,

	tagName: "label",
	classNames: [ "input-btn-component" ],
	classNameBindings: [ "checked", "disabled" ]

}).reopenClass({
	positionalParams: [ "label" ]
});
