import Ember from "Ember";
import layout from "templates/components/stream/StatsRowComponent.hbs";


export default Ember.Component.extend({
	layout,

	tagName: "div",
	classNameBindings: [ ":stats-row-component", "class" ],

	withFlag: true
});
