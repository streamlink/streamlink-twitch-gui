import { computed } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";


export default Mixin.create({
	/** @type {SettingsService} */
	settings: service(),

	language: computed(
		"settings.content.streams.filter_languages",
		"settings.content.streams.language",
		function() {
			const { filter_languages, language } = this.settings.content.streams;

			return filter_languages
				? language
				: undefined;
		}
	),

	model( params ) {
		const { language } = this;

		return this._super( Object.assign( params || {}, { language } ) );
	}
});
