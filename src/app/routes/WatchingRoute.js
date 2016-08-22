import Ember from "Ember";
import toArray from "utils/ember/toArray";
import mapBy from "utils/ember/mapBy";
import preload from "utils/preload";


	var get = Ember.get;


	export default Ember.Route.extend({
		livestreamer: Ember.inject.service(),

		model: function() {
			var records = get( this, "livestreamer.model" );

			return Promise.resolve( records )
				.then( toArray )
				.then( mapBy( "stream" ) )
				.then( preload( "preview.large_nocache" ) )
				// return the original record array
				.then(function() { return records; });
		}
	});
