import {
	attr,
	Model
} from "EmberData";


export default Model.extend({
	channels: attr( "number" ),
	viewers: attr( "number" )

}).reopenClass({
	toString: function() { return "kraken/streams/summary"; }
});
