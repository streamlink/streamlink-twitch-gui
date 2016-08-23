import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	width : attr( "number", { defaultValue: null } ),
	height: attr( "number", { defaultValue: null } ),
	x     : attr( "number", { defaultValue: null } ),
	y     : attr( "number", { defaultValue: null } )

}).reopenClass({
	toString: function() { return "Window"; }
});
