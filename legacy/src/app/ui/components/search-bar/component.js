import Component from "@ember/component";
import { set, getWithDefault } from "@ember/object";
import { sort } from "@ember/object/computed";
import { on } from "@ember/object/evented";
import { run } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { vars as varsConfig } from "config";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import Search from "data/models/search/model";
import getStreamFromUrl from "utils/getStreamFromUrl";
import layout from "./template.hbs";
import "./styles.less";


const { "search-history-size": searchHistorySize } = varsConfig;
const { filters } = Search;


export default Component.extend( HotkeyMixin, /** @class SearchBarComponent */  {
	/** @type {RouterService} */
	router: service(),
	/** @type {DS.Store} */
	store: service(),

	layout,
	tagName: "nav",
	classNames: [ "search-bar-component" ],

	// the record array (will be set by init())
	model: null,
	// needed by SortableMixin's arrangedContent
	content: sort( "model", "sortBy" ),
	sortBy: [ "date:desc" ],

	showDropdown: false,

	query: "",
	reQuery: /^\S+/,

	filters,
	filter: "all",


	hotkeysNamespace: "searchbar",
	hotkeys: {
		focus: "focus"
	},


	init() {
		this._super( ...arguments );

		this.store.findAll( "search" )
			.then( records => {
				set( this, "model", records );
			});
	},


	async addRecord( query, filter ) {
		const { /** @type {DS.RecordArray<Search>} */ model } = this;
		const match = model.find( record => query === record.query && filter === record.filter );
		const date = new Date();

		// found a matching record? just update the date property, save the record and return
		if ( match ) {
			set( match, "date", date );
			await match.save();
			return;
		}

		const id = 1 + Number( getWithDefault( model, "lastObject.id", 0 ) );

		// we don't want to store more than X records
		const { length } = model;
		/* istanbul ignore else */
		if ( length >= searchHistorySize ) {
			/** @type {Ember.MutableArray} */
			const sorted = model.sortBy( "date" );
			const start = searchHistorySize - 1;
			const num = length - start;
			const old = sorted.removeAt( start, num );
			await run( () => Promise.all(
				old.map( oldRecord => oldRecord.destroyRecord() )
			) );
		}

		// create a new record
		let record = this.store.createRecord( "search", { id, query, filter, date } );
		await record.save();
		model.addObject( record );
	},

	async deleteAllRecords() {
		// delete all records at once and then clear the record array
		const { model } = this;
		model.forEach( record => record.deleteRecord() );
		await model.save();
		model.clear();
		this.store.unloadAll( "search" );
	},

	doSearch( query, filter ) {
		set( this, "showDropdown", false );
		this.addRecord( query, filter );

		this.router.transitionTo( "search", { queryParams: { filter, query } } );
	},


	_prepareDropdown: on( "didInsertElement", function() {
		// dropdown
		const { /** @type {HTMLElement} */ element } = this;
		const dropdown = element.querySelector( ".searchbar-dropdown" );
		const button = element.querySelector( ".btn-dropdown" );
		const search = element.querySelector( "input[type='search']" );

		search.addEventListener( "focus", ({ target }) => target.select() );

		element.ownerDocument.body.addEventListener( "click", ({ target }) => {
			// ignore clicks on the input, the dropdown button and on the dropdown itself
			if (
				   this.showDropdown
				&& !search.contains( target )
				&& !button.contains( target )
				&& !dropdown.contains( target )
			) {
				set( this, "showDropdown", false );
			}
		});
	}),


	actions: {
		back() {
			this.router.history( -1 );
		},

		forward() {
			this.router.history( +1 );
		},

		refresh() {
			this.router.refresh();
		},

		focus() {
			this.element.querySelector( "input[type='search']" ).focus();
		},

		toggleDropdown() {
			set( this, "showDropdown", !this.showDropdown );
		},

		clear() {
			set( this, "query", "" );
		},

		submit() {
			let query = this.query.trim();
			let filter = this.filter;

			const stream = getStreamFromUrl( query );
			if ( stream ) {
				query  = stream;
				filter = "channels";
			}

			if ( this.reQuery.test( query ) ) {
				this.doSearch( query, filter );
			}
		},

		searchHistory({ query, filter }) {
			this.doSearch( query, filter );
		},

		clearHistory() {
			this.deleteAllRecords();
		}
	}
});
