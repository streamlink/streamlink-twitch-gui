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
import getStreamFromUrl from "utils/getStreamFromUrl";
import layout from "templates/components/SearchBarComponent.hbs" ;


const { sort } = computed;
const { service } = inject;
const { next } = run;
const { "search-history-size": searchHistorySize } = vars;


export default Component.extend({
	store: service(),

	layout,
	tagName: "nav",
	classNames: [ "search-bar-component" ],

	// the record array (will be set by init())
	model: null,
	// needed by SortableMixin's arrangedContent
	content: sort( "model", "sortBy" ),
	sortBy: [ "date:desc" ],

	reQuery: /^[a-z0-9]{3,}/i,

	showDropdown: false,
	filter: "all",
	query: "",


	init() {
		this._super( ...arguments );

		this.content.volatile();

		var store   = get( this, "store" );
		var filters = store.modelFor( "search" ).filters;
		set( this, "filters", filters );

		store.findAll( "search" )
			.then(function( records ) {
				set( this, "model", records );
			}.bind( this ) );
	},


	addRecord( query, filter ) {
		var store = get( this, "store" );
		var model = get( this, "model" );
		var match = model.filter(function( record ) {
			return query  === get( record, "query" )
			    && filter === get( record, "filter" );
		});
		var record;

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
		var id = 1 + Number( getWithDefault( model, "lastObject.id", 0 ) );
		var date = new Date();
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
		var model = get( this, "model" );
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

		var targetObject = get( this, "targetObject" );
		targetObject.transitionToRoute( "search", {
			queryParams: {
				filter,
				query
			}
		});
	},


	_prepareDropdown: on( "didInsertElement", function() {
		// dropdown
		var self     = this;
		var $element = self.$();
		var dropdown = $element.find( ".searchbar-dropdown" )[0];
		var button   = $element.find( ".btn-dropdown" )[0];
		var search   = $element.find( "input[type='search']" ).focus(function() {
			next( this, this.select );
		})[0];

		$( document.body ).click(function( event ) {
			var $target = $( event.target );
			// ignore clicks on the input, the dropdown button and on the dropdown itself
			if (
				   !$target.closest( search ).length
				&& !$target.closest( button ).length
				&& !$target.closest( dropdown ).length
			) {
				set( self, "showDropdown", false );
			}
		});
	}),


	actions: {
		toggleDropdown() {
			var showDropdown = get( this, "showDropdown" );
			set( this, "showDropdown", !showDropdown );
		},

		clear() {
			set( this, "query", "" );
		},

		submit() {
			var query  = get( this, "query" ).trim();
			var filter = get( this, "filter" );

			var stream = getStreamFromUrl( query );
			if ( stream ) {
				query  = stream;
				filter = "channels";
			}

			if ( this.reQuery.test( query ) ) {
				this.doSearch( query, filter );
			}
		},

		searchHistory( record ) {
			var query  = get( record, "query" );
			var filter = get( record, "filter" );
			this.doSearch( query, filter );
		},

		clearHistory() {
			this.deleteAllRecords();
		}
	}
});
