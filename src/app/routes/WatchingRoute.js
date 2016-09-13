import {
	get,
	inject,
	Route
} from "Ember";
import { mapBy } from "utils/ember/recordArrayMethods";
import preload from "utils/preload";


const { service } = inject;


export default Route.extend({
	livestreamer: service(),

	model() {
		var records = get( this, "livestreamer.model" );

		return Promise.resolve( records )
			.then( mapBy( "stream" ) )
			.then( preload( "preview.large_nocache" ) )
			// return the original record array
			.then(function() { return records; });
	}
});
