import DS from "EmberData";


var attr = DS.attr;


export default DS.Model.extend({
	// pass through: don't update the channel record
	channel   : attr(),
	created_at: attr( "date" )

}).reopenClass({
	toString: function() { return "kraken/users/:user/subscriptions"; }
});
