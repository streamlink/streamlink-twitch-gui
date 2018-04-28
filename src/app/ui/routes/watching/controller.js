import Controller from "@ember/controller";
import { get } from "@ember/object";
import { sort } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { qualities } from "data/models/stream/model";
import "./styles.less";


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
