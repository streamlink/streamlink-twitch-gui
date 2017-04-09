import {
	get,
	inject,
	run,
	Service
} from "ember";
import {
	chat as chatConfig,
	twitch as twitchConfig
} from "config";
import { openBrowser } from "nwjs/Shell";
import Logger from "utils/Logger";
import Parameter from "utils/parameters/Parameter";
import ParameterCustom from "utils/parameters/ParameterCustom";
import Substitution from "utils/parameters/Substitution";
import whichFallback from "utils/node/fs/whichFallback";
import { isFile } from "utils/node/fs/stat";
import { spawn } from "child_process";
import {
	dirname,
	join
} from "path";


const { service } = inject;
const { next } = run;
const { "chat-url": twitchChatUrl } = twitchConfig;

const { logDebug, logError } = new Logger( "ChatService" );


function launch( exec, params ) {
	return new Promise(function( resolve, reject ) {
		let child = spawn( exec, params, {
			detached: true,
			stdio: "ignore"
		});
		child.unref();
		child.on( "error", reject );
		next( resolve );
	});
}


export default Service.extend({
	auth: service(),
	settings: service(),


	/**
	 * @param channel
	 * @returns {Promise}
	 */
	async open( channel ) {
		let url  = twitchChatUrl;
		let name = get( channel, "name" );

		if ( !url || !name ) {
			return Promise.reject( new Error( "Missing URL or channel name" ) );
		}

		url = url.replace( "{channel}", name );

		let method   = get( this, "settings.chat_method" );
		let command  = get( this, "settings.chat_command" ).trim();

		try {
			switch ( method ) {
				case "default":
				case "browser":
					return await this._openDefaultBrowser( url );
				case "irc":
					return await this._openIRC( channel );
				case "chromium":
				case "chrome":
					return await this._openPredefined( command, method, url );
				case "msie":
					return await this._openMSIE( url );
				case "chatty":
					return await this._openChatty( command, name );
				case "custom":
					return await this._openCustom( command, name, url );
				default:
					throw new Error( "Invalid chat method" );
			}
		} catch ( err ) {
			await logError( err, { name, method, command } );
			throw err;
		}
	},


	async _openDefaultBrowser( url ) {
		await logDebug( "Opening chat in the system's default browser", {
			url
		});

		return openBrowser( url );
	},


	_openIRC() {
		return Promise.reject( new Error( "Not yet implemented" ) );
	},


	async _openPredefined( command, key, url ) {
		if ( !chatConfig.hasOwnProperty( key ) ) {
			return Promise.reject( new Error( "Missing chat data" ) );
		}

		let { args, exec, fallback } = chatConfig[ key ];

		let context = { args, url };
		let paramsPredefined = [
			new ParameterCustom( null, "args", [
				new Substitution( "url", "url" )
			])
		];

		let resolvedExec = command.length
			// user has set a custom executable path
			? await whichFallback( command )
			// no custom command
			: await whichFallback( exec, fallback );

		let params = Parameter.getParameters( context, paramsPredefined );

		await logDebug( "Launching chat application", {
			name: key,
			exec: resolvedExec,
			params
		});

		return launch( resolvedExec, params );
	},


	async _openMSIE( url ) {
		if ( !chatConfig.hasOwnProperty( "msie" ) ) {
			return Promise.reject( new Error( "Missing chat data" ) );
		}

		let { args, exec, script } = chatConfig[ "msie" ];

		// the script needs to be inside the application's folder
		script = join( dirname( process.execPath ), script );

		let [ resolvedExec ] = await Promise.all([
			whichFallback( exec, null ),
			whichFallback( script, null, isFile )
		]);

		let context = { args, url, script };
		let paramsMSIE = [
			new ParameterCustom( null, "args", [
				new Substitution( "url", "url" ),
				new Substitution( "script", "script" )
			])
		];

		let params = Parameter.getParameters( context, paramsMSIE );

		await logDebug( "Launching MSIE", {
			exec: resolvedExec,
			params
		});

		return launch( resolvedExec, params );
	},


	async _openChatty( command, channel ) {
		if ( !chatConfig.hasOwnProperty( "chatty" ) ) {
			return Promise.reject( new Error( "Missing chat data" ) );
		}

		let isLoggedIn = get( this, "auth.session.isLoggedIn" );
		let token      = get( this, "auth.session.access_token" );
		let user       = get( this, "auth.session.user_name" );

		let {
			args: javaArgs,
			exec: javaExec,
			fallback: javaFb,
			"chatty-args": chattyArgs,
			"chatty-args-noauth": chattyArgsNoAuth,
			"chatty-script": chattyScript
		} = chatConfig[ "chatty" ];

		// object containing all the required data
		let context = {
			args: isLoggedIn
				? chattyArgs
				: chattyArgsNoAuth,
			command,
			token,
			user,
			channel
		};

		// custom parameter substitutions
		let substitutions = [
			new Substitution( "channel", "channel" )
		];

		if ( isLoggedIn ) {
			substitutions.push(
				new Substitution( "user", "user" ),
				new Substitution( "token", "token" )
			);
		}

		// just a single custom parameter, so a string can be defined in package.json
		let paramsChatty = [
			new ParameterCustom( null, "args", substitutions )
		];

		let resolvedExec;
		if ( !command ) {
			// look for a chatty startscript if no chatty jar file has been set
			resolvedExec = await whichFallback( chattyScript );

		} else {
			// validate java installation and check for existing chatty .jar file
			let [ _resolvedExec, jar ] = await Promise.all([
				whichFallback( javaExec, javaFb ),
				whichFallback( command, null, isFile )
			]);
			resolvedExec = _resolvedExec;
			// alter command line
			context.args = `${javaArgs} ${context.args}`;
			context.command = jar;
			substitutions.push( new Substitution( "jar", "command" ) );
		}

		let params = Parameter.getParameters( context, paramsChatty );

		await logDebug( "Launching Chatty", {
			exec: resolvedExec,
			params
		});

		return launch( resolvedExec, params );
	},


	substitutionsCustom: [
		new Substitution( "url", "url", "Twitch chat URL" ),
		new Substitution( "user", "user", "User name" ),
		new Substitution( "channel", "channel", "Channel name" ),
		new Substitution( "token", "token", "Twitch access token" )
	],

	async _openCustom( command, channel, url ) {
		let user = get( this, "auth.session.user_name" );
		let token = get( this, "auth.session.access_token" );

		let context = {
			command,
			channel,
			url,
			user,
			token
		};

		let paramsCustom = [
			new ParameterCustom( null, "command", this.substitutionsCustom )
		];

		let params = Parameter.getParameters( context, paramsCustom );
		let exec   = params.shift();

		let resolvedExec = await whichFallback( exec );

		await logDebug( "Launching custom chat application", {
			exec: resolvedExec,
			params
		});

		return launch( resolvedExec, params );
	}
});
