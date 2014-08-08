define( [ "ember", "models/Search" ], function( Ember, Search ) {

	return Ember.ArrayController.extend({
		needs: [ "search" ],

		sortedContent: function() {
			return this.get( "content" ).toArray().sort(function( a, b ) {
				return b.id - a.id;
			});
		}.property( "content", "content.@each", "showDropdown" ),

		showDropdown: false,

		filters: function() { return Search.filters; }.property(),

		filter: "all",
		query: "",


		addRecord: function( query, filter ) {
			// search history
			this.store.findAll( "searchbar" ).then(function( all ) {
				var	length	= all.content.length,
					newid	= length > 0
						? Number( all.content[ length - 1 ].id ) + 1
						: 1;

				// don't store more than 5 records...
				// find a matching record first

				// this.store.findQuery( "searchbar", { query: query, filter: filter })
				// findQuery maybe broken on LSAdapter?! let's implement a custom solution
				new Promise(function( resolve, reject ) {
					for ( var i = 0, record; record = all.content[ i++ ]; ) {
						if (
								query === record.get( "query" )
							&&	filter === record.get( "filter" )
						) {
							resolve( record );
							return;
						}
					}
					reject();
				})
					// found a record? delete it!
					.then(function( record ) {
						record.destroyRecord();
					})
					// not found? delete the 5th-last one!
					.catch(function() {
						all.content.slice( 0, -4 ).forEach(function( record ) {
							Ember.run.once( this, function() {
								record.deleteRecord();
								record.save();
							});
						}, this );
					}.bind( this ) )
					// then create the new record
					.then(function() {
						this.store.createRecord( "searchbar", {
							id		: newid,
							query	: query,
							filter	: filter,
							date	: +new Date()
						}).save();
					}.bind( this ) );
			}.bind( this ) );
		},


		actions: {
			"toggleDropdown": function() {
				this.toggleProperty( "showDropdown" );

				if ( this.get( "showDropdown" ) ) {
					// load recent searches
					this.store.findAll( "searchbar" ).then(function( content ) {
						this.set( "content", content );
					}.bind( this ) );
				}
			},

			"clear": function() {
				this.set( "query", "" );
			},

			"submit": function() {
				var	query	= this.get( "query" ).trim(),
					filter	= this.get( "filter" );

				if ( !/^[a-z0-9]{3,}/i.test( query ) ) { return; }

				this.addRecord( query, filter );

				this.set( "showDropdown", false );
				this.send( "goto", "search", filter, query );
			},

			"clearHistory": function() {
				this.store.findAll( "searchbar" ).then(function( all ) {
					all.content.forEach(function( record ) {
						Ember.run.once( this, function() {
							record.deleteRecord();
							record.save();
						});
					}, this );
				});
			},

			"searchHistory": function( record ) {
				this.set( "showDropdown", false );
				this.send( "goto", "search", record.get( "filter" ), record.get( "query" ) );
			}
		}
	});

});
