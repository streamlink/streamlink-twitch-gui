import {
	get,
	inject,
	Route
} from "ember";
import RefreshMixin from "./mixins/refresh";
import { mapBy } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


const { service } = inject;


export default Route.extend( RefreshMixin, {
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
