import {
	attr,
	Model
} from "ember-data";


export default Model.extend({
	version: attr( "string", { defaultValue: "" } ),
	checkagain: attr( "number", { defaultValue: 0 } )

}).reopenClass({
	toString() { return "Versioncheck"; }
});
