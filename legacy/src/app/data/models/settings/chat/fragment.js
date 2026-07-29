import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import chatProviders from "services/chat/providers";


const defaultProvider = Object.keys( chatProviders )[0] || "browser";


export default Fragment.extend({
	provider: attr( "string", { defaultValue: defaultProvider } ),
	providers: fragment( "settingsChatProviders", { defaultValue: {} } )
});
