import Component from "@ember/component";
import { get, set, getWithDefault } from "@ember/object";
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


// TODO: rewrite SearchBarComponent and Search model
export default Component.extend( HotkeyMixin, {
	/** @type {RouterService} */
	router: service(),
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


	hotkeys: [
		{
			key: "/",
			action: "focus"
		}
	],


	init() {
		this._super( ...arguments );

		const store = get( this, "store" );
		store.findAll( "search" )
			.then( records => {
				set( this, "model", records );
			});
	},


	async addRecord( query, filter ) {
		const store = get( this, "store" );
		const model = get( this, "model" );
		const match = model.filter( record =>
			    query === get( record, "query" )
			&& filter === get( record, "filter" )
		);
		let record;

		// found a matching record? just update the date property, save the record and return
		if ( get( match, "length" ) === 1 ) {
			set( match[0], "date", new Date() );
			await match[0].save();
			return;
		}

		// we don't want to store more than X records
		if ( get( model, "length" ) >= searchHistorySize ) {
			const oldestRecord = model.sortBy( "date" ).shiftObject();
			await run( () => oldestRecord.destroyRecord() );
		}

		// create a new record
		const id = 1 + Number( getWithDefault( model, "lastObject.id", 0 ) );
		const date = new Date();
		record = store.createRecord( "search", { id, query, filter, date } );
		await record.save();
		model.addObject( record );
	},

	async deleteAllRecords() {
		// delete all records at once and then clear the record array
		const model = get( this, "model" );
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
		const element = this.element;
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
			const showDropdown = get( this, "showDropdown" );
			set( this, "showDropdown", !showDropdown );
		},

		clear() {
			set( this, "query", "" );
		},

		submit() {
			let query = get( this, "query" ).trim();
			let filter = get( this, "filter" );

			const stream = getStreamFromUrl( query );
			if ( stream ) {
				query  = stream;
				filter = "channels";
			}

			if ( this.reQuery.test( query ) ) {
				this.doSearch( query, filter );
			}
		},

		searchHistory( record ) {
			const query = get( record, "query" );
			const filter = get( record, "filter" );
			this.doSearch( query, filter );
		},

		clearHistory() {
			this.deleteAllRecords();
		}
	}
});
