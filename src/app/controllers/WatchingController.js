define([
	"Ember",
	"models/localstorage/Settings"
], function(
	Ember,
	Settings
) {

	var get = Ember.get;
	var sort = Ember.computed.sort;


	return Ember.Controller.extend({
		auth: Ember.inject.service(),
		livestreamer: Ember.inject.service(),

		sortedModel: sort( "model", "sortBy" ),
		sortBy: [ "started:desc" ],

		qualities: Settings.qualities,

		actions: {
			"openDialog": function( stream ) {
				get( this, "livestreamer" ).startStream( stream );
			},

			"closeStream": function( stream ) {
				get( this, "livestreamer" ).closeStream( stream );
			}
		}
	});

});
