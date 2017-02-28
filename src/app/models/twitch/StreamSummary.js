import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	channels: attr( "number" ),
	viewers: attr( "number" )

}).reopenClass({
	toString() { return "kraken/streams/summary"; }
});
