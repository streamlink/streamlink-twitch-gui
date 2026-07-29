import { computed } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import { ATTR_STREAMS_LANGUAGES_FILTER } from "data/models/settings/streams/fragment";


export default Mixin.create({
	/** @type {SettingsService} */
	settings: service(),

	language: computed(
		"settings.content.streams.languages_filter",
		"settings.content.streams.languages",
		function() {
			const { languages_filter, languages } = this.settings.content.streams;

			return languages_filter !== ATTR_STREAMS_LANGUAGES_FILTER
				? []
				: Object.entries( languages.toJSON() )
					.filter( ([ , value ]) => value )
					.map( ([ key ]) => key.toLowerCase() );
		}
	),

	model( params, ...args ) {
		const { language } = this;
		if ( language.length ) {
			params = Object.assign(
				params || /* istanbul ignore next */ {},
				{ language }
			);
		}

		return this._super( params, ...args );
	}
});
