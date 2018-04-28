import { main as mainConfig, notification as notificationConfig } from "config";
import Process from "nwjs/process";
import promiseChildprocess from "utils/node/child_process/promise";
import { is64bit, isWinGte8 } from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";
import which from "utils/node/fs/which";
import snoretoastBinaries from "snoretoast-binaries";


const { "display-name": displayName } = mainConfig;
const {
	provider: {
		snoretoast: {
			timeoutSetup,
			timeoutNotify
		}
	}
} = notificationConfig;

//const EXIT_CODE_FAILED  = -1;
const EXIT_CODE_SUCCESS   = 0;
//const EXIT_CODE_HIDDEN  = 1;
const EXIT_CODE_DISMISSED = 2;
const EXIT_CODE_TIMEOUT   = 3;

const MSG_CLICK = "The user clicked on the toast.";


/**
 * Action center notifications provided by SnoreToast
 *
 * @class NotificationProviderSnoreToest
 * @implements NotificationProvider
 */
export default class NotificationProviderSnoreToast {
	static isSupported() {
		return isWinGte8;
	}

	async setup() {
		const path = resolvePath(
			"%NWJSAPPPATH%",
			...snoretoastBinaries[ is64bit ? "x64" : "x86" ]
		);
		this.exec = await which( path );

		await promiseChildprocess(
			[
				this.exec,
				[
					"-install",
					`${displayName}.lnk`,
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
	}

	async notify( data ) {
		// if notifications are disabled in Windows, the exit code will also be 0
		// we need to also parse stdout and wait for an expected string to be returned
		let clicked = false;

		await promiseChildprocess(
			[
				this.exec,
				[
					"-appID",
					displayName,
					"-silent",
					"-w",
					"-t",
					data.title,
					"-m",
					data.getMessageAsString(),
					"-p",
					data.icon
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

					//case EXIT_CODE_FAILED:
					//case EXIT_CODE_HIDDEN:
					default:
						return reject();
				}
			},
			line => {
				if ( line === MSG_CLICK ) {
					clicked = true;
				}
			},
			null,
			timeoutNotify
		);
	}
}
