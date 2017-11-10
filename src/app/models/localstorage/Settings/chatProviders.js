import {
	Fragment,
	fragment
} from "model-fragments";
import { typeKey } from "./chatProvider";
import chatProviders from "services/ChatService/providers";


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
