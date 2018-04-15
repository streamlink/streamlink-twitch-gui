import { get, computed } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";


export default Mixin.create({
	settings: service(),

	broadcaster_language: computed(
		"settings.streams.filter_languages",
		"settings.streams.languages",
		function() {
			if ( !get( this, "settings.streams.filter_languages" ) ) { return; }

			const filters = get( this, "settings.streams.languages" ).toJSON();
			const keys = Object.keys( filters );
			const filtered = keys.filter( lang => filters[ lang ] );

			// ignore if all languages are (un)checked
			return filtered.length > 0 && filtered.length !== keys.length
				? filtered.join( "," )
				: undefined;
		}
	),

	model( params ) {
		const broadcaster_language = get( this, "broadcaster_language" );

		return this._super( Object.assign( params || {}, { broadcaster_language } ) );
	}
});
