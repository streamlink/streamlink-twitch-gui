import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export default class SettingsStreamingProvider extends Fragment {
	@attr( "string" )
	exec;
	@attr( "string" )
	params;
	@attr( "string" )
	pythonscript;
}
