import DS from "EmberData";


var belongsTo = DS.belongsTo;


export default DS.Model.extend({
	stream: belongsTo( "twitchStream", { async: false } )

}).reopenClass({
	toString: function() { return "kraken/search/streams"; }
});
