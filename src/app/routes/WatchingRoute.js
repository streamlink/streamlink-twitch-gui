import { get } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import RefreshRouteMixin from "./mixins/refresh";
import { mapBy } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


export default Route.extend( RefreshRouteMixin, {
	streaming: service(),

	model() {
		let records = get( this, "streaming.model" );

		return Promise.resolve( records )
			.then( records => mapBy( records, "stream" ) )
			.then( records => preload( records, "preview.largeLatest" ) )
			// return the original record array
			.then(function() { return records; });
	}
});
