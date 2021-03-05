import { main as mainConfig, notification as notificationConfig } from "config";
import Process from "nwjs/process";
import promiseChildprocess from "utils/node/child_process/promise";
import onShutdown from "utils/node/onShutdown";
import { is64bit, isWinGte8 } from "utils/node/platform";
import which from "utils/node/fs/which";
import snoretoastBinaries from "snoretoast-binaries";
import { EventEmitter } from "events";
import { createServer } from "net";
import { resolve } from "path";


const {
	"display-name": displayName,
	"app-identifier": appIdentifier
} = mainConfig;
const {
	provider: {
		snoretoast: {
			timeoutSetup,
			timeoutNotify
		}
	}
} = notificationConfig;


export const EXIT_CODE_FAILED    = -1;
export const EXIT_CODE_SUCCESS   = 0;
export const EXIT_CODE_HIDDEN    = 1;
export const EXIT_CODE_DISMISSED = 2;
export const EXIT_CODE_TIMEOUT   = 3;


/**
 * Action center notifications provided by SnoreToast
 *
 * @class NotificationProviderSnoreToest
 * @implements NotificationProvider
 * @member {Server} server
 * @member {EventEmitter} messages
 */
export default class NotificationProviderSnoreToast {
	notificationId = 0;
	pipeName = `\\\\.\\pipe\\${appIdentifier}`;

	messages = new EventEmitter();

	static isSupported() {
		return isWinGte8;
	}

	async setup() {
		const path = resolve( ...snoretoastBinaries[ is64bit ? "x64" : "x86" ] );
		this.exec = await which( path );

		await promiseChildprocess(
			[
				this.exec,
				[
					"-install",
					displayName,
					Process.execPath,
					displayName
				]
			],
			( code, resolve, reject ) => code === 0
				? resolve()
				: reject( new Error( "Could not install application shortcut" ) ),
			null,
			null,
			timeoutSetup
		);

		try {
			await new Promise( ( resolve, reject ) => {
				this.server = createServer();
				this.server.once( "error", reject );
				this.server.listen( this.pipeName, resolve );
				this.server.on( "connection", conn => {
					conn.on( "data", buffer => {
						const message = this._parseNamedPipeData( buffer );
						this.messages.emit( "message", message );
					});
				});
			});
		} catch ( err ) {
			await this.cleanup();
			throw err;
		}
		onShutdown( () => this.cleanup() );
	}

	async cleanup() {
		if ( !this.server ) { return; }
		this.server.close();
		this.server = null;
	}

	async notify( data ) {
		// if notifications are disabled in Windows, the exit code will also be 0
		// since snoretoast >= 0.6.0:
		// read from the named pipe and wait for the "clicked" event to be emitted
		let clicked = false;
		const notificationId = ++this.notificationId;
		const onMessage = data => {
			if (
				   data[ "action" ] === "clicked"
				&& Number( data[ "notificationId" ] ) === notificationId
				&& data[ "pipe" ] === this.pipeName
				&& data[ "application" ] === Process.execPath
			) {
				clicked = true;
			}
		};
		this.messages.addListener( "message", onMessage );

		await promiseChildprocess(
			[
				this.exec,
				[
					"-appID",
					displayName,
					"-silent",
					"-t",
					data.title,
					"-m",
					data.getMessageAsString(),
					"-p",
					data.icon,
					"-id",
					String( notificationId ),
					"-pipeName",
					this.pipeName,
					"-application",
					Process.execPath
				],
				{
					// only pipe stdout
					stdio: [ 1 ]
				}
			],
			( code, resolve, reject ) => {
				switch ( code ) {
					case EXIT_CODE_SUCCESS:
						if ( clicked && data.click ) {
							data.click();
						}
						return resolve();

					case EXIT_CODE_DISMISSED:
					case EXIT_CODE_TIMEOUT:
						return resolve();

					case EXIT_CODE_FAILED:
					case EXIT_CODE_HIDDEN:
					default:
						return reject();
				}
			},
			null,
			null,
			timeoutNotify
		)
			.finally( () => this.messages.removeListener( "message", onMessage ) );
	}

	/**
	 * @param {Buffer} buffer
	 * @returns {Object<string,string>}
	 */
	_parseNamedPipeData( buffer ) {
		return buffer.toString( "utf16le" )
			.split( ";" )
			.filter( str => str.includes( "=" ) )
			.reduce( ( obj, str ) => {
				const items = str.split( "=" );
				obj[ items.shift() ] = items.join( "=" );

				return obj;
			}, {} );
	}
}
