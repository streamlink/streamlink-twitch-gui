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
	streaming: service(),

	sortedModel: sort( "model", "sortBy" ),
	sortBy: [ "started:desc" ],

	qualities,

	actions: {
		openDialog( stream ) {
			get( this, "streaming" ).startStream( stream );
		},

		closeStream( stream ) {
			get( this, "streaming" ).closeStream( stream );
		}
	}
});
