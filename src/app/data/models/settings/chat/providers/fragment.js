import { defineProperty } from "@ember/object";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import chatProviders from "services/chat/providers";
import { typeKey } from "../provider/fragment";


class SettingsChatProviders extends Fragment {}

for ( const [ type ] of Object.entries( chatProviders ) ) {
	const prop = fragment( "settings-chat-provider", {
		defaultValue: {
			[ typeKey ]: `settings-chat-provider-${type}`
		},
		polymorphic: true,
		typeKey
	});
	defineProperty( SettingsChatProviders.prototype, type, prop );
}


export default SettingsChatProviders;
