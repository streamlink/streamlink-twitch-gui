import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	/** @type {StreamingService} */
	streaming: service(),

	/**
	 * @return {Promise<DS.RecordArray<Stream>>}
	 */
	async model() {
		await preload(
			this.streaming.model.map( stream => stream.stream ),
			"thumbnail_url.latest"
		);

		return this.streaming.model;
	}
});
