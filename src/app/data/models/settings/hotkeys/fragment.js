import { defineProperty } from "@ember/object";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { hotkeys as hotkeysConfig } from "config";
import { typeKey } from "./namespace/fragment";


class SettingsHotkeys extends Fragment {}

for ( const [ type, { actions } ] of Object.entries( hotkeysConfig ) ) {
	let hasActions = false;
	const defaultValue = {};
	for ( const [ action, hotkey ] of Object.entries( actions ) ) {
		if ( typeof hotkey === "string" ) { continue; }
		defaultValue[ action ] = {
			primary: {},
			secondary: {}
		};
		hasActions = true;
	}
	// namespaces without actions should not exist
	if ( !hasActions ) { continue; }

	const prop = fragment( "settings-hotkeys-namespace", {
		defaultValue: Object.assign( defaultValue, {
			[ typeKey ]: `settings-hotkeys-namespace-${type}`
		}),
		polymorphic: true,
		typeKey
	});
	defineProperty( SettingsHotkeys.prototype, type, prop );
}


export default SettingsHotkeys;
