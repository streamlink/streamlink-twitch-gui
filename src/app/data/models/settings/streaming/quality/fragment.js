import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export default class SettingsStreamingQuality extends Fragment {
	@attr( "string" )
	quality;
	@attr( "string" )
	exclude;
}
