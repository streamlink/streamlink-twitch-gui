import attr from "ember-data/attr";
import Model from "ember-data/model";


// noinspection JSValidateTypes
export default Model.extend( /** @class Search */ {
	/** @type {string} */
	query: attr( "string" ),
	/** @type {string} */
	filter: attr( "string" ),
	/** @type {Date} */
	date: attr( "date" )

}).reopenClass({
	toString() { return "Search"; },

	filters: [
		{ id: "all" },
		{ id: "games" },
		{ id: "channels" }
	]
});
