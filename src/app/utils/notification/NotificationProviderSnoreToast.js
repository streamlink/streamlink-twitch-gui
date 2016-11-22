import { main } from "config";
import NotificationProvider from "./NotificationProvider";
import { is64bit } from "utils/node/platform";
import resolvePath from "utils/node/resolvePath";
import which from "utils/node/fs/which";
import { spawn } from "child_process";


// require binary dependencies
// avoid using webpack's buggy recursive require.context method and list files explicitly
import "file?name=bin/win32/snoretoast.exe!snoretoast/bin/x86/SnoreToast.exe";
import "file?name=bin/win64/snoretoast.exe!snoretoast/bin/x64/SnoreToast.exe";


const { "display-name": displayName } = main;

//const EXIT_CODE_FAILED  = -1;
const EXIT_CODE_SUCCESS   = 0;
//const EXIT_CODE_HIDDEN  = 1;
const EXIT_CODE_DISMISSED = 2;
const EXIT_CODE_TIMEOUT   = 3;


export default class NotificationProviderSnoreToast extends NotificationProvider {
	constructor( exec ) {
		super();
		this.exec = exec;
	}

	static test() {
		let exec = resolvePath(
			"%NWJSAPPPATH%",
			"bin",
			is64bit ? "win64" : "win32",
			"snoretoast.exe"
		);

		return which( exec )
			.then( NotificationProviderSnoreToast.install );
	}

	static install( exec ) {
		return new Promise( ( resolve, reject ) => {
			let params = [
				"-install",
				`${displayName}.lnk`,
				process.execPath,
				displayName
			];
			let install = spawn( exec, params );

			install.once( "error", reject );
			install.once( "exit", code => code === 0
				? resolve( exec )
				: reject( new Error( "Could not install application shortcut" ) )
			);
		});
	}

	notify( data ) {
		return new Promise( ( resolve, reject ) => {
			let params = [
				"-appID",
				displayName,
				"-silent",
				"-w",
				"-t",
				data.title,
				"-m",
				NotificationProvider.getMessageAsString( data.message ),
				"-p",
				data.icon
			];
			let notification = spawn( this.exec, params );

			notification.once( "error", reject );
			notification.once( "exit", code => {
				switch ( code ) {
					case EXIT_CODE_SUCCESS:
						if ( data.click ) {
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
			});
		});
	}
}


NotificationProviderSnoreToast.platforms = {
	win32gte8: "growl"
};
