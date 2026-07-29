import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { hotkeys as hotkeysConfig } from "config";
import { typeKey } from "./namespace/fragment";


const attributes = {};
for ( const [ namespaceName, { actions } ] of Object.entries( hotkeysConfig ) ) {
	const defaultValue = {};
	for ( const [ action, hotkey ] of Object.entries( actions ) ) {
		if ( typeof hotkey === "string" ) { continue; }
		defaultValue[ action ] = {
			primary: {},
			secondary: {}
		};
	}
	// namespaces without actions should not exist
	if ( !Object.keys( defaultValue ).length ) { continue; }
	defaultValue[ typeKey ] = `settings-hotkeys-namespace-${namespaceName}`;
	attributes[ namespaceName ] = fragment( "settings-hotkeys-namespace", {
		defaultValue,
		polymorphic: true,
		typeKey
	});
}


export default Fragment.extend( attributes );
