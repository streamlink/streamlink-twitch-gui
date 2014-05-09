define( [ "ember", "models/Search" ], function( Ember, Search ) {

	return Ember.ObjectController.extend({
		needs: [ "search" ],

		showDropdown: false,

		filters: function() { return Search.filters; }.property(),

		filter: "all",
		query: "",

		actions: {
			"toggleDropdown": function() {
				this.toggleProperty( "showDropdown" );
			},

			"clear": function() {
				this.set( "query", "" );
			},

			"submit": function() {
				var query = this.get( "query" ).trim();
				if ( !/^[a-z0-9]{3,}/i.test( query ) ) { return; }
				this.set( "showDropdown", false );
				this.send( "goto", "search", this.get( "filter" ), query );
			}
		}
	});

});
