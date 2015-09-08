define([
	"Ember",
	"text!templates/components/searchbar.html.hbs"
], function( Ember, layout ) {

	var get = Ember.get;
	var set = Ember.set;
	var sort = Ember.computed.sort;

	return Ember.Component.extend({
		store: Ember.inject.service(),

		layout: Ember.HTMLBars.compile( layout ),
		tagName: "nav",
		classNames: [ "searchbar" ],

		// the record array (will be set by init())
		model: null,
		// needed by SortableMixin's arrangedContent
		content: sort( "model", "sortBy" ),
		sortBy: [ "date:desc" ],

		numKeepItems: 5,
		reQuery: /^[a-z0-9]{3,}/i,

		showDropdown: false,
		filter: "all",
		query: "",

		updateFormattedTime: 0,


		init: function() {
			this._super.apply( this, arguments );

			this.content.volatile();

			var store   = get( this, "store" );
			var filters = store.modelFor( "search" ).filters;
			set( this, "filters", filters );

			store.findAll( "search" )
				.then(function( records ) {
					set( this, "model", records );
				}.bind( this ) );
		},


		addRecord: function( query, filter ) {
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
			if ( get( model, "length" ) >= get( this, "numKeepItems" ) ) {
				// delete the oldest record
				model.sortBy( "date" ).shiftObject().destroyRecord();
			}

			// create a new record
			record = store.createRecord( "search", {
				id    : 1 + Number( Ember.getWithDefault( model, "lastObject.id", 0 ) ),
				query : query,
				filter: filter,
				date  : new Date()
			});
			record.save().then(function () {
				model.addObject( record );
			});
		},

		deleteAllRecords: function() {
			var model = get( this, "model" );
			model.forEach(function( record ) {
				record.deleteRecord();
			});
			// delete all records at once and then clear the record array
			model.save().then(function() {
				model.clear();
			});
		},

		doSearch: function( query, filter ) {
			set( this, "showDropdown", false );
			this.addRecord( query, filter );
			var targetObject = get( this, "targetObject" );
			targetObject.transitionToRoute( "search", filter, query );
		},


		_prepareDropdown: function() {
			// dropdown
			var self     = this;
			var $element = self.$();
			var dropdown = $element.find( ".searchbar-dropdown" )[0];
			var button   = $element.find( ".btn-dropdown" )[0];
			var search   = $element.find( "input[type='search']" ).focus(function() {
				Ember.run.next( this, this.select );
			})[0];

			Ember.$( document.body ).click(function( event ) {
				var $target = Ember.$( event.target );
				// ignore clicks on the input, the dropdown button and on the dropdown itself
				if (
					   !$target.closest( search ).length
					&& !$target.closest( button ).length
					&& !$target.closest( dropdown ).length
				) {
					set( self, "showDropdown", false );
				}
			});
		}.on( "didInsertElement" ),


		actions: {
			"toggleDropdown": function() {
				var showDropdown = get( this, "showDropdown" );
				if ( !showDropdown ) {
					set( this, "updateFormattedTime", +new Date() );
				}
				set( this, "showDropdown", !showDropdown );
			},

			"clear": function() {
				set( this, "query", "" );
			},

			"submit": function() {
				var query  = get( this, "query" ).trim();
				var filter = get( this, "filter" );

				if ( this.reQuery.test( query ) ) {
					this.doSearch( query, filter );
				}
			},

			"searchHistory": function( record ) {
				var query  = get( record, "query" );
				var filter = get( record, "filter" );
				this.doSearch( query, filter );
			},

			"clearHistory": function() {
				this.deleteAllRecords();
			}
		}
	});

});
