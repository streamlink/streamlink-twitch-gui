import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { hotkeys as hotkeysConfig } from "config";


const typeKey = "type";
const namespaces = new Map();


const SettingsHotkeysNamespace = Fragment.extend();


for ( const [ namespaceName, { actions } ] of Object.entries( hotkeysConfig ) ) {
	const attributes = {};
	for ( const [ action, hotkeys ] of Object.entries( actions ) ) {
		if ( typeof hotkeys === "string" ) { continue; }
		attributes[ action ] = fragment( "settings-hotkeys-action", { defaultValue: {} } );
	}
	// namespaces without actions should not exist
	if ( !Object.keys( attributes ).length ) { continue; }
	const namespace = SettingsHotkeysNamespace.extend( attributes );
	namespaces.set( namespaceName, namespace );
}


export {
	typeKey,
	namespaces,
	SettingsHotkeysNamespace as default
};
