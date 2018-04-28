import { providers } from "data/models/settings/chat/provider/fragment";
import Serializer from "data/models/settings/chat/provider/serializer";


export default {
	name: "settings-chat-provider",

	initialize( application ) {
		for ( const [ type, model ] of providers ) {
			application.register( `model:settings-chat-provider-${type}`, model );
			application.register( `serializer:settings-chat-provider-${type}`, Serializer );
		}
	}
};
