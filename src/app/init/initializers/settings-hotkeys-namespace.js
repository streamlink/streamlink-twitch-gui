import { namespaces } from "data/models/settings/hotkeys/namespace/fragment";
import Serializer from "data/models/settings/hotkeys/namespace/serializer";


export default {
	name: "settings-hotkeys-namespace",

	initialize( application ) {
		for ( const [ type, model ] of namespaces ) {
			application.register( `model:settings-hotkeys-namespace-${type}`, model );
			application.register( `serializer:settings-hotkeys-namespace-${type}`, Serializer );
		}
	}
};
