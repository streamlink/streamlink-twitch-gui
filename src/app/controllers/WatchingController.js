import {
	get,
	computed,
	inject,
	Controller
} from "Ember";
import qualities from "models/stream/qualities";


const { sort } = computed;
const { service } = inject;


export default Controller.extend({
	auth: service(),
	streamservice: service( "stream" ),

	sortedModel: sort( "model", "sortBy" ),
	sortBy: [ "started:desc" ],

	qualities,

	actions: {
		openDialog( stream ) {
			get( this, "streamservice" ).startStream( stream );
		},

		closeStream( stream ) {
			get( this, "streamservice" ).closeStream( stream );
		}
	}
});
