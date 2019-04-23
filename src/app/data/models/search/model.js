import { computed } from "@ember/object";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { name } from "utils/decorators";


const { hasOwnProperty } = {};


@name( "Search" )
export default class Search extends Model {
	static filters = [
		{ label: "All", id: "all" },
		{ label: "Game", id: "games" },
		{ label: "Channel", id: "channels" },
		{ label: "Stream", id: "streams" }
	];

	@computed()
	static get filtersmap() {
		return this.filters.reduce( ( map, filter ) => {
			map[ filter.id ] = filter;

			return map;
		}, {} );
	}

	static getLabel( filter ) {
		const { filtersmap } = this;

		return hasOwnProperty.call( filtersmap, filter )
			? filtersmap[ filter ].label
			: "All";
	}

	@attr( "string" )
	query;
	@attr( "string" )
	filter;
	@attr( "date" )
	date;

	@computed( "filter" )
	get label() {
		return this.constructor.getLabel( this.filter );
	}
}
