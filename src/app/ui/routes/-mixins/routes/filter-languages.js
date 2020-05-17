import { computed } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import { ATTR_FILTER_LANGUAGES_FILTER } from "data/models/settings/streams/fragment";


export default Mixin.create({
	/** @type {SettingsService} */
	settings: service(),

	language: computed(
		"settings.content.streams.filter_languages",
		"settings.content.streams.language",
		function() {
			const { filter_languages, language } = this.settings.content.streams;

			return filter_languages === ATTR_FILTER_LANGUAGES_FILTER
				? language
				: undefined;
		}
	),

	model( params ) {
		const { language } = this;

		return this._super( Object.assign( params || {}, { language } ) );
	}
});
