import {
	get,
	computed,
	inject,
	Controller
} from "Ember";
import Settings from "models/localstorage/Settings";


const { sort } = computed;
const { service } = inject;


export default Controller.extend({
	auth: service(),
	livestreamer: service(),

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
