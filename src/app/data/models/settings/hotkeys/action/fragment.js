import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "utils/decorators";


export default class SettingsHotkeysAction extends Fragment {
	@fragment( "settings-hotkeys-hotkey" )
	primary;
	@fragment( "settings-hotkeys-hotkey" )
	secondary;
}
