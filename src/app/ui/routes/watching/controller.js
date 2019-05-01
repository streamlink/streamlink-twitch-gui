import Controller from "@ember/controller";
import { action } from "@ember/object";
import { sort } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { qualities } from "data/models/stream/model";
import "./styles.less";


export default class WatchingController extends Controller {
	/** @type {AuthService} */
	@service auth;
	/** @type {StreamingService} */
	@service streaming;

	@sort( "model", "sortBy" )
	sortedModel;
	sortBy = [ "started:desc" ];

	qualities = qualities;

	@action
	openDialog( stream ) {
		this.streaming.startStream( stream );
	}

	@action
	closeStream( stream ) {
		this.streaming.closeStream( stream );
	}
}
