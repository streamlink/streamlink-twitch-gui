define([
	"Ember"
], function(
	Ember
) {

	var get = Ember.get;

	var reFilter = /^\w+$/;


	return Ember.Controller.extend({
		filter: "",

		modelFiltered: function() {
			var filter = get( this, "filter" ).toLowerCase();
			if ( !reFilter.test( filter ) ) {
				return get( this, "model" );
			}

			return get( this, "all" ).filter(function( item ) {
				return get( item, "settings.id" ).toLowerCase().indexOf( filter ) !== -1;
			});
		}.property( "model.[]", "all", "filter" ),


		actions: {
			"erase": function( modelItem ) {
				var model = get( this, "model" );
				var settingsRecord = get( modelItem, "settings" );
				if ( get( settingsRecord, "isDeleted" ) ) { return; }

				settingsRecord.destroyRecord()
					.then(function() {
						model.removeObject( modelItem );
					});
			}
		}
	});

});
