import { attr } from "ember-data";
import {
	Fragment,
	fragment
} from "model-fragments";
import chatProviders from "services/ChatService/providers";


const defaultProvider = Object.keys( chatProviders )[0] || "browser";


export default Fragment.extend({
	provider: attr( "string", { defaultValue: defaultProvider } ),
	providers: fragment( "settingsChatProviders", { defaultValue: {} } )
});
