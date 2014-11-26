define( [ "ember" ], function( Ember ) {

	var	get = Ember.get,
		set = Ember.set;

	return Ember.ArrayController.extend({
		numKeepItems: 5,

		sortProperties: [ "date" ],
		sortAscending: false,

		showDropdown: false,
		updateFormattedTime: 0,
		filter: "all",
		query: "",

		reQuery: /^[a-z0-9]{3,}/i,


		init: function() {
			this._super();

			set( this, "filters", this.store.modelFor( "search" ).filters );

			this.store.find( "search" ).then(function( records ) {
				set( this, "model", records );
			}.bind( this ) );
		},


		addRecord: function( query, filter ) {
			var	model = get( this, "model" ),
				match = model.filter(function( record ) {
					return	 query === get( record, "query" )
						&&	filter === get( record, "filter" );
				}),
				record;

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
			record = this.store.createRecord( "search", {
				id: 1 + Number( Ember.getWithDefault( model, "lastObject.id", 0 ) ),
				query: query,
				filter: filter,
				date: new Date()
			});
			record.save().then(function () {
				model.addRecord( record );
			});
		},

		deleteAllRecords: function() {
			var model = get( this, "model" );
			model.content.forEach(function( record ) {
				record.deleteRecord();
			});
			// delete all records at once and then clear the deleted records
			model.save().then(function() {
				model.clear();
			});
		},

		doSearch: function( query, filter ) {
			set( this, "showDropdown", false );
			this.addRecord( query, filter );
			this.transitionToRoute( "search", filter, query );
		},


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
				var	query	= get( this, "query" ).trim(),
					filter	= get( this, "filter" );

				if ( this.reQuery.test( query ) ) {
					this.doSearch( query, filter );
				}
			},

			"searchHistory": function( record ) {
				this.doSearch(
					get( record, "query" ),
					get( record, "filter" )
				);
			},

			"clearHistory": function() {
				this.deleteAllRecords();
			}
		}
	});

});
