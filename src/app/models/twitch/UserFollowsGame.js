import DS from "EmberData";


	export default DS.Model.extend({
		// we're not interested in any of the properties of this record
		// all properties will be deleted by the serializer

	}).reopenClass({
		toString: function() { return "api/users/:user/follows/games"; }
	});
