import attr from "ember-data/attr";
import Model from "ember-data/model";


export default Model.extend({
	channels: attr( "number" ),
	viewers: attr( "number" )

}).reopenClass({
	toString() { return "kraken/streams/summary"; }
});
