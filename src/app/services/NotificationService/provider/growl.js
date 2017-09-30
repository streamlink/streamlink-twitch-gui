import NotificationProvider from "./provider";
import growly from "growly";
import { main } from "config";
import { connect } from "net";


const { "display-name": displayName } = main;

const reClick = /^click(ed)?$/i;
const growlPorts = [
	// default growl port
	23053,
	// growl-fork port
	23052
];


export default class NotificationProviderGrowl extends NotificationProvider {
	constructor( port ) {
		super();
		this.port = port;
	}

	static test() {
		return growlPorts.reduce( ( chain, port ) => {
			return chain.catch( () => NotificationProviderGrowl.checkConnection( port ) );
		}, Promise.reject() )
			.then( NotificationProviderGrowl.register );
	}

	static checkConnection( port ) {
		return new Promise( ( resolve, reject ) => {
			let socket = connect( port, "localhost" );
			socket.setTimeout( 100 );

			socket.on( "connect", () => {
				socket.end();
				resolve( port );
			});

			socket.on( "error", () => {
				socket.end();
				reject( new Error( "Could not connect to the growl server" ) );
			});
		});
	}

	static register( port ) {
		return new Promise( ( resolve, reject ) => {
			growly.register( displayName, "", [
				{ label: displayName }
			], err => {
				if ( err ) {
					reject( err );
				} else {
					resolve( port );
				}
			});
		});
	}

	notify( data ) {
		return new Promise( ( resolve, reject ) => {
			growly.setHost( "localhost", this.port );
			growly.notify( NotificationProvider.getMessageAsString( data.message ), {
				title: data.title,
				icon: data.icon,
				label: displayName
			}, ( err, action ) => {
				if ( err ) {
					reject( err );
				} else {
					if ( reClick.test( action ) && data.click ) {
						data.click();
					}
					resolve();
				}
			});
		});
	}
}


NotificationProviderGrowl.platforms = {
	win32: "rich",
	darwin: "rich",
	linux: "rich"
};
