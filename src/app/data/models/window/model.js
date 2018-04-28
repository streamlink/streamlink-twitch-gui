import attr from "ember-data/attr";
import Model from "ember-data/model";


export default Model.extend({
	x: attr( "number", { defaultValue: null } ),
	y: attr( "number", { defaultValue: null } ),
	width: attr( "number", { defaultValue: null } ),
	height: attr( "number", { defaultValue: null } ),
	maximized: attr( "boolean", { defaultValue: false } )

}).reopenClass({
	toString() { return "Window"; }
});
