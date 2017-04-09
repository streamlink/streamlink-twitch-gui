import {
	get,
	inject,
	Route
} from "ember";
import RefreshRouteMixin from "mixins/RefreshRouteMixin";
import { mapBy } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


const { service } = inject;


export default Route.extend( RefreshRouteMixin, {
	streaming: service(),

	model() {
		let records = get( this, "streaming.model" );

		return Promise.resolve( records )
			.then( mapBy( "stream" ) )
			.then( preload( "preview.largeLatest" ) )
			// return the original record array
			.then(function() { return records; });
	}
});
