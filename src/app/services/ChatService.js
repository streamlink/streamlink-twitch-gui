import {
	get,
	inject,
	run,
	Service
} from "Ember";
import {
	chat as chatConfig,
	twitch as twitchConfig
} from "config";
import { openBrowser } from "nwjs/Shell";
import Parameter from "utils/Parameter";
import ParameterCustom from "utils/ParameterCustom";
import Substitution from "utils/Substitution";
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
	open( channel ) {
		let url  = twitchChatUrl;
		let name = get( channel, "id" );

		if ( !url || !name ) {
			return Promise.reject( new Error( "Missing URL or channel name" ) );
		}

		url = url.replace( "{channel}", name );

		let method   = get( this, "settings.chat_method" );
		let command  = get( this, "settings.chat_command" ).trim();

		switch ( method ) {
			case "default":
			case "browser":
				return this._openDefaultBrowser( url );
			case "irc":
				return this._openIRC( channel );
			case "chromium":
			case "chrome":
				return this._openPredefined( command, method, url );
			case "msie":
				return this._openMSIE( url );
			case "chatty":
				return this._openChatty( command, name );
			case "custom":
				return this._openCustom( command, name, url );
			default:
				return Promise.reject( new Error( "Invalid chat method" ) );
		}
	},


	_openDefaultBrowser( url ) {
		return new Promise(function( resolve ) {
			openBrowser( url );
			next( resolve );
		});
	},


	_openIRC() {
		return Promise.reject( new Error( "Not yet implemented" ) );
	},


	_openPredefined( command, key, url ) {
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

		let promise = command.length
			// user has set a custom executable path
			? whichFallback( command )
			// no custom command
			: whichFallback( exec, fallback );

		return promise
			.then( exec => {
				let params = Parameter.getParameters( context, paramsPredefined );
				return launch( exec, params );
			});
	},


	_openMSIE( url ) {
		if ( !chatConfig.hasOwnProperty( "msie" ) ) {
			return Promise.reject( new Error( "Missing chat data" ) );
		}

		let { args, exec, script } = chatConfig[ "msie" ];

		// the script needs to be inside the application's folder
		script = join( dirname( process.execPath ), script );

		return Promise.all([
			whichFallback( exec, null ),
			whichFallback( script, null, isFile )
		])
			.then( ([ exec ]) => {
				let context = { args, url, script };
				let paramsMSIE = [
					new ParameterCustom( null, "args", [
						new Substitution( "url", "url" ),
						new Substitution( "script", "script" )
					])
				];

				let params = Parameter.getParameters( context, paramsMSIE );
				return launch( exec, params );
			});
	},


	_openChatty( command, channel ) {
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

		let promise = !command
			// look for a chatty startscript if no chatty jar file has been set
			? whichFallback( chattyScript )
			// validate java installation and check for existing chatty .jar file
			: Promise.all([
				whichFallback( javaExec, javaFb ),
				whichFallback( command, null, isFile )
			])
				.then( ([ exec, jar ]) => {
					// alter command line
					context.args = `${javaArgs} ${context.args}`;
					context.command = jar;
					substitutions.push( new Substitution( "jar", "command" ) );
					return exec;
				});

		return promise
			.then( exec => {
				let params = Parameter.getParameters( context, paramsChatty );
				return launch( exec, params );
			});
	},


	substitutionsCustom: [
		new Substitution( "url", "url", "Twitch chat URL" ),
		new Substitution( "user", "user", "User name" ),
		new Substitution( "channel", "channel", "Channel name" ),
		new Substitution( "token", "token", "Twitch access token" )
	],

	_openCustom( command, channel, url ) {
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

		return whichFallback( exec )
			.then( exec => launch( exec, params ) );
	}
});
