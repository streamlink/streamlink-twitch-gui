import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { hotkeys as hotkeysConfig } from "config";


export default Controller.extend({
	// filter out alias-actions
	defaultHotkeys: computed(function() {
		const namespaces = {};
		for ( const [ name, { icon, actions: data } ] of Object.entries( hotkeysConfig ) ) {
			const actions = {};
			for ( const [ action, hotkeys ] of Object.entries( data ) ) {
				if ( typeof hotkeys === "string" ) { continue; }
				const [ primary, secondary = null ] = hotkeys;
				actions[ action ] = { primary, secondary };
			}
			if ( !Object.keys( actions ).length ) { continue; }
			namespaces[ name ] = { icon, actions };
		}

		return namespaces;
	})
});
