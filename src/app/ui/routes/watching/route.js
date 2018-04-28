import { get } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import RefreshRouteMixin from "ui/routes/-mixins/routes/refresh";
import { mapBy } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	streaming: service(),

	async model() {
		const model = get( this, "streaming.model" );
		await preload( mapBy( model, "stream" ), "preview.largeLatest" );

		return model;
	}
});
