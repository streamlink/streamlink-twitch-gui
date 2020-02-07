import ChatProvider from "./-provider";
import whichFallback from "utils/node/fs/whichFallback";
import ParameterCustom from "utils/parameters/ParameterCustom";
import Substitution from "utils/parameters/Substitution";
import t from "translation-key";


/**
 * @class ChatProviderBasic
 * @implements ChatProvider
 */
export default class ChatProviderBasic extends ChatProvider {
	static get userArgsSubstitutions() {
		return [
			new Substitution(
				"url",
				"url",
				t`settings.chat.provider.providers.basic.substitutions.url`
			),
			new Substitution(
				"channel",
				"channel",
				t`settings.chat.provider.providers.basic.substitutions.channel`
			),
			new Substitution(
				"user",
				"user",
				t`settings.chat.provider.providers.basic.substitutions.user`
			),
			new Substitution(
				"token",
				"token",
				t`settings.chat.provider.providers.basic.substitutions.token`
			)
		];
	}

	async _getExec( config, userConfig ) {
		// don't use fallbacks if the user has set a custom exec path
		return userConfig[ "exec" ]
			? await whichFallback( userConfig[ "exec" ] )
			: await whichFallback( config[ "exec" ], config[ "fallback" ] );
	}

	// noinspection JSCheckFunctionSignatures
	async _getParameters() {
		return [
			new ParameterCustom( null, "args", ChatProviderBasic.userArgsSubstitutions )
		];
	}

	_getRuntimeContext( { name: channel }, session ) {
		const { user_name: user, access_token: token, isLoggedIn } = session;
		const url = this._getUrl( channel );

		return Object.assign( {}, this.context, { url, channel, user, token, isLoggedIn } );
	}
}
