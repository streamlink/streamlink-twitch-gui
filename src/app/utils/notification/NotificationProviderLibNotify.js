import { main } from "config";
import NotificationProvider from "./NotificationProvider";
import which from "utils/node/fs/which";
import { spawn } from "child_process";


const { "display-name": displayName } = main;


export default class NotificationProviderLibNotify extends NotificationProvider {
	constructor( exec ) {
		super();
		this.exec = exec;
	}

	static test() {
		return which( "notify-send" );
	}

	notify( data ) {
		return new Promise( ( resolve, reject ) => {
			let params = [
				"--app-name",
				displayName,
				"--icon",
				data.icon,
				data.title,
				NotificationProvider.getMessageAsString( data.message )
			];
			let notification = spawn( this.exec, params );

			notification.once( "error", reject );
			notification.once( "exit", code => code === 0
				? resolve()
				: reject( new Error( "Could not display notification" ) )
			);
		});
	}
}


NotificationProviderLibNotify.platforms = {
	linux: "growl"
};
