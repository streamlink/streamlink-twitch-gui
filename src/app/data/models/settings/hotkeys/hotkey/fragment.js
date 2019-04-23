import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";


export default class SettingsHotkeysHotkey extends Fragment {
	@attr( "boolean", { defaultValue: false } )
	disabled;
	@attr( "string", { defaultValue: null } )
	code;
	@attr( "boolean", { defaultValue: false } )
	altKey;
	@attr( "boolean", { defaultValue: false } )
	ctrlKey;
	@attr( "boolean", { defaultValue: false } )
	metaKey;
	@attr( "boolean", { defaultValue: false } )
	shiftKey;
}
