import { defineProperty } from "@ember/object";
import { fragment } from "ember-data-model-fragments/attributes";
import Fragment from "ember-data-model-fragments/fragment";
import { hotkeys as hotkeysConfig } from "config";


const typeKey = "type";
const namespaces = new Map();


class SettingsHotkeysNamespace extends Fragment {}


for ( const [ namespaceName, { actions } ] of Object.entries( hotkeysConfig ) ) {
	const namespace = class extends SettingsHotkeysNamespace {};

	let hasActions = false;
	for ( const [ action, hotkeys ] of Object.entries( actions ) ) {
		if ( typeof hotkeys === "string" ) { continue; }
		const prop = fragment( "settings-hotkeys-action" );
		defineProperty( namespace.prototype, action, prop );
		hasActions = true;
	}
	// namespaces without actions should not exist
	if ( !hasActions ) { continue; }

	namespaces.set( namespaceName, namespace );
}


export {
	typeKey,
	namespaces,
	SettingsHotkeysNamespace as default
};
