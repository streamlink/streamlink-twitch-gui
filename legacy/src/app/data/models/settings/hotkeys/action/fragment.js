import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";


export default Fragment.extend({
	primary: fragment( "settings-hotkeys-hotkey", { defaultValue: {} } ),
	secondary: fragment( "settings-hotkeys-hotkey", { defaultValue: {} } )
});
