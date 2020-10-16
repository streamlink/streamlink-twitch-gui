import { computed } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";


export default Mixin.create({
	/** @type {SettingsService} */
	settings: service(),

	language: computed(
		"settings.content.hasSingleStreamsLanguagesSelection",
		"settings.content.streams.languages_filter",
		"settings.content.streams.languages",
		function() {
			const settings = this.settings.content;
			const { languages_filter, languages } = settings.streams;

			if ( languages_filter && settings.hasSingleStreamsLanguagesSelection ) {
				for ( const [ key, value ] of Object.entries( languages.toJSON() ) ) {
					if ( value ) {
						return key;
					}
				}
			}

			return undefined;
		}
	),

	model( params ) {
		const { language } = this;

		return this._super(
			Object.assign( params || /* istanbul ignore next */ {}, { language } )
		);
	}
});
