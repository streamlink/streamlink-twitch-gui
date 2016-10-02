import {
	get,
	computed,
	inject,
	Controller
} from "Ember";
import qualities from "models/LivestreamerQualities";


const { sort } = computed;
const { service } = inject;


export default Controller.extend({
	auth: service(),
	livestreamer: service(),

	sortedModel: sort( "model", "sortBy" ),
	sortBy: [ "started:desc" ],

	qualities,

	actions: {
		openDialog( stream ) {
			get( this, "livestreamer" ).startStream( stream );
		},

		closeStream( stream ) {
			get( this, "livestreamer" ).closeStream( stream );
		}
	}
});
