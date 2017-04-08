import {
	get,
	set,
	getWithDefault,
	$,
	computed,
	inject,
	run,
	on,
	Component
} from "Ember";
import { vars } from "config";
import HotkeyMixin from "mixins/HotkeyMixin";
import getStreamFromUrl from "utils/getStreamFromUrl";
import layout from "templates/components/SearchBarComponent.hbs" ;


const { sort } = computed;
const { service } = inject;
const { next } = run;
const { "search-history-size": searchHistorySize } = vars;


export default Component.extend( HotkeyMixin, {
	routing: service( "-routing" ),
	store: service(),

	layout,
	tagName: "nav",
	classNames: [ "search-bar-component" ],

	// the record array (will be set by init())
	model: null,
	// needed by SortableMixin's arrangedContent
	content: sort( "model", "sortBy" ),
	sortBy: [ "date:desc" ],

	reQuery: /^\S{3,}/,

	showDropdown: false,
	filter: "all",
	query: "",

	hotkeys: [
		{
			code: "Slash",
			action: "focus"
		}
	],


	init() {
		this._super( ...arguments );

		this.content.volatile();

		const store = get( this, "store" );
		const filters = store.modelFor( "search" ).filters;
		set( this, "filters", filters );

		store.findAll( "search" )
			.then( records => {
				set( this, "model", records );
			});
	},


	addRecord( query, filter ) {
		const store = get( this, "store" );
		const model = get( this, "model" );
		const match = model.filter( function( record ) {
			return query === get( record, "query" )
				&& filter === get( record, "filter" );
		} );
		let record;

		// found a matching record? just update the date property and save the record
		if ( get( match, "length" ) === 1 ) {
			set( match[0], "date", new Date() );
			return match[0].save();
		}

		// we don't want to store more than X records
		if ( get( model, "length" ) >= searchHistorySize ) {
			// delete the oldest record
			model.sortBy( "date" ).shiftObject().destroyRecord();
		}

		// create a new record
		const id = 1 + Number( getWithDefault( model, "lastObject.id", 0 ) );
		const date = new Date();
		record = store.createRecord( "search", {
			id,
			query,
			filter,
			date
		});
		record.save().then(function () {
			model.addObject( record );
		});
	},

	deleteAllRecords() {
		const model = get( this, "model" );
		model.forEach(function( record ) {
			record.deleteRecord();
		});
		// delete all records at once and then clear the record array
		model.save().then(function() {
			model.clear();
		});
	},

	doSearch( query, filter ) {
		set( this, "showDropdown", false );
		this.addRecord( query, filter );

		get( this, "routing" ).transitionTo( "search", [], {
			filter,
			query
		});
	},


	_prepareDropdown: on( "didInsertElement", function() {
		// dropdown
		const $element = this.$();
		const dropdown = $element.find( ".searchbar-dropdown" )[ 0 ];
		const button = $element.find( ".btn-dropdown" )[ 0 ];
		const search = $element.find( "input[type='search']" )
			.focus(function() {
				next( this, this.select );
			})[ 0 ];

		$( document.body ).click( event => {
			const $target = $( event.target );
			// ignore clicks on the input, the dropdown button and on the dropdown itself
			if (
				   !$target.closest( search ).length
				&& !$target.closest( button ).length
				&& !$target.closest( dropdown ).length
			) {
				set( this, "showDropdown", false );
			}
		});
	}),


	actions: {
		back() {
			get( this, "routing" ).history( -1 );
		},

		forward() {
			get( this, "routing" ).history( +1 );
		},

		refresh() {
			get( this, "routing" ).refresh();
		},

		focus() {
			this.$( "input[type='search']" ).focus();
		},

		toggleDropdown() {
			let showDropdown = get( this, "showDropdown" );
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
