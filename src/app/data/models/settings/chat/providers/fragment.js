import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { typeKey } from "../provider/fragment";
import chatProviders from "services/chat/providers";


const attributes = {};
for ( const [ type ] of Object.entries( chatProviders ) ) {
	attributes[ type ] = fragment( "settings-chat-provider", {
		defaultValue: {
			[ typeKey ]: `settings-chat-provider-${type}`
		},
		polymorphic: true,
		typeKey
	});
}


export default Fragment.extend( attributes );
