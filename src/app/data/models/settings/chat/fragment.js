import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import chatProviders from "services/chat/providers";
import { fragment } from "utils/decorators";


const defaultProvider = Object.keys( chatProviders )[0] || "browser";


export default class SettingsChat extends Fragment {
	@attr( "string", { defaultValue: defaultProvider } )
	provider;
	/** @type {SettingsChatProviders} */
	@fragment( "settings-chat-providers" )
	providers;
}
