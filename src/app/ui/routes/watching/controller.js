import Controller from "@ember/controller";
import { sort } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { qualities } from "data/models/stream/model";
import "./styles.less";


export default Controller.extend({
	/** @type {AuthService} */
	auth: service(),
	/** @type {StreamingService} */
	streaming: service(),

	sortedModel: sort( "model", "sortBy" ),
	sortBy: [ "started:desc" ],

	qualities,

	actions: {
		openDialog( stream ) {
			this.streaming.startStream( stream );
		},

		closeStream( stream ) {
			this.streaming.closeStream( stream );
		}
	}
});
