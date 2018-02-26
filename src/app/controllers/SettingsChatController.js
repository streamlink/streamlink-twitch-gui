import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { chat as chatConfig } from "config";
import { providers } from "models/localstorage/Settings/chatProvider";
import ChatProviderBasic from "services/ChatService/providers/-basic";
import { platform } from "utils/node/platform";


const { userArgsSubstitutions } = ChatProviderBasic;


export default Controller.extend({
	chat: service(),

	providers,
	chatConfig,
	userArgsSubstitutions,

	contentChatProvider: computed(function() {
		const list = [];
		for ( const [ id ] of providers ) {
			const { label, exec } = chatConfig[ id ];
			if ( exec instanceof Object && !exec[ platform ] ) { continue; }
			list.push({ id, label });
		}
		return list;
	}),

	// EmberData (2.9) is stupid and uses an internal Map implementation that is not iterable
	// so we can't iterate SettingsChatProvider.attributes in the template
	providerAttributes: computed(function() {
		const map = {};
		for ( const [ id, provider ] of providers ) {
			const attrs = [];
			const attributes = get( provider, "attributes" );
			attributes.forEach( attribute => attrs.push( attribute ) );
			map[ id ] = attrs;
		}
		return map;
	})
});
