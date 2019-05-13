import Component from "@ember/component";
import { set, action } from "@ember/object";
import { sort } from "@ember/object/computed";
import { run } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { classNames, layout, tagName } from "@ember-decorators/component";
import { on } from "@ember-decorators/object";
import { vars as varsConfig } from "config";
import HotkeyMixin from "ui/components/-mixins/hotkey";
import Search from "data/models/search/model";
import getStreamFromUrl from "utils/getStreamFromUrl";
import template from "./template.hbs";
import "./styles.less";


const { "search-history-size": searchHistorySize } = varsConfig;
const { filters } = Search;


// TODO: rewrite SearchBarComponent and Search model
@layout( template )
@tagName( "nav" )
@classNames( "search-bar-component" )
export default class SearchBarComponent extends Component.extend( HotkeyMixin ) {
	/** @type {RouterService} */
	@service router;
	/** @type {DS.Store} */
	@service store;

	/** @type {DS.RecordArray} */
	model = null;

	@sort( "model", "sortBy" )
	content;
	sortBy = [ "date:desc" ];

	showDropdown = false;

	query = "";
	reQuery = /^\S+/;

	filters = filters;
	filter = "all";


	hotkeysNamespace = "searchbar";
	hotkeys = {
		focus: "focus"
	};


	@on( "init" )
	async _setModel() {
		const records = await this.store.findAll( "search" );
		set( this, "model", records );
	}


	async addRecord( query, filter ) {
		const model = this.model;
		const match = model.filter( record =>
			    query === record.query
			&& filter === record.filter
		);
		let record;

		// found a matching record? just update the date property, save the record and return
		if ( match.length === 1 ) {
			set( match[0], "date", new Date() );
			await match[0].save();
			return;
		}

		// we don't want to store more than X records
		if ( model.length >= searchHistorySize ) {
			const oldestRecord = model.sortBy( "date" ).shiftObject();
			await run( () => oldestRecord.destroyRecord() );
		}

		// create a new record
		const id = 1 + Number( model.lastObject.id || 0 );
		const date = new Date();
		record = this.store.createRecord( "search", { id, query, filter, date } );
		await record.save();
		model.addObject( record );
	}

	async deleteAllRecords() {
		// delete all records at once and then clear the record array
		const model = this.model;
		model.forEach( record => record.deleteRecord() );
		await model.save();
		model.clear();
		this.store.unloadAll( "search" );
	}

	doSearch( query, filter ) {
		set( this, "showDropdown", false );
		this.addRecord( query, filter );

		this.router.transitionTo( "search", { queryParams: { filter, query } } );
	}


	@on( "didInsertElement" )
	_prepareDropdown() {
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
	}


	@action
	back() {
		this.router.history( -1 );
	}

	@action
	forward() {
		this.router.history( +1 );
	}

	@action
	refresh() {
		this.router.refresh();
	}

	@action
	focus() {
		this.element.querySelector( "input[type='search']" ).focus();
	}

	@action
	toggleDropdown() {
		set( this, "showDropdown", !this.showDropdown );
	}

	@action
	clear() {
		set( this, "query", "" );
	}

	@action
	submit() {
		let query = this.query.trim();
		let filter = this.filter;

		const stream = getStreamFromUrl( query );
		if ( stream ) {
			query = stream;
			filter = "channels";
		}

		if ( this.reQuery.test( query ) ) {
			this.doSearch( query, filter );
		}
	}

	@action
	searchHistory( record ) {
		this.doSearch( record.query, record.filter );
	}

	@action
	clearHistory() {
		this.deleteAllRecords();
	}
}
