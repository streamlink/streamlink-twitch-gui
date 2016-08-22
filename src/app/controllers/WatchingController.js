import Ember from "Ember";
import Settings from "models/localstorage/Settings";


	var get = Ember.get;
	var sort = Ember.computed.sort;


	export default Ember.Controller.extend({
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
