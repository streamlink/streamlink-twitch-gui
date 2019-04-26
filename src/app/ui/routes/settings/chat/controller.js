import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { chat as chatConfig, twitch as twitchConfig } from "config";
import { providers } from "data/models/settings/chat/provider/fragment";
import ChatProviderBasic from "services/chat/providers/-basic";
import { platform } from "utils/node/platform";


const { "chat-url": twitchChatUrl } = twitchConfig;
const { userArgsSubstitutions } = ChatProviderBasic;


export default class SettingsChatController extends Controller {
	/** @type {ChatService} */
	@service chat;

	providers = providers;
	chatConfig = chatConfig;
	userArgsSubstitutions = userArgsSubstitutions;

	@computed()
	get contentChatProvider() {
		const list = [];
		for ( const [ id ] of providers ) {
			const { exec } = chatConfig[ id ];
			if ( exec instanceof Object && !exec[ platform ] ) { continue; }
			list.push({ id });
		}
		return list;
	}

	@computed()
	get contentChatUrl() {
		return Object.keys( twitchChatUrl )
			.map( id => ({ id }) );
	}

	// EmberData (2.9) is stupid and uses an internal Map implementation that is not iterable
	// so we can't iterate SettingsChatProvider.attributes in the template
	@computed()
	get providerAttributes() {
		const map = {};
		for ( const [ id, provider ] of providers ) {
			const attrs = [];
			const attributes = get( provider, "attributes" );
			attributes.forEach( attribute => attrs.push( attribute ) );
			map[ id ] = attrs;
		}
		return map;
	}
}
