import NotificationProvider from "./NotificationProvider";
import checkGrowl from "node-notifier/lib/checkGrowl";
import Growl from "node-notifier/notifiers/growl";
import { main } from "config";
import FS from "fs";
import UTIL from "util";


const { "display-name": displayName } = main;
const growlPorts = [
	// default growl port
	23053,
	// growl-fork port
	23052
];


function NotificationProviderGrowl( data ) {
	this.provider = new Growl({
		name: displayName,
		port: data.port
	});
}

UTIL.inherits( NotificationProviderGrowl, NotificationProvider );

NotificationProviderGrowl.platforms = {
	win32: "rich",
	darwin: "rich",
	linux: "rich"
};

/**
 * @returns {Promise}
 */
NotificationProviderGrowl.test = function() {
	function testGrowlConnection( port ) {
		return new Promise(function( resolve, reject ) {
			checkGrowl( { port: port }, function( success ) {
				if ( success ) {
					resolve({ port: port });
				} else {
					reject( new Error( "Could not connect to the growl server" ) );
				}
			});
		});
	}

	return growlPorts.reduce(function( chain, port ) {
		return chain.catch( testGrowlConnection.bind( null, port ) );
	}, Promise.reject() );
};

NotificationProviderGrowl.prototype.notify = function( data ) {
	return new Promise(function( resolve, reject ) {
		if ( !data.icon ) {
			return resolve();
		}
		FS.readFile( data.icon.replace( /^file:\/\//, "" ), function( err, content ) {
			if ( err ) {
				reject();
			} else {
				data.icon = content;
				resolve( data );
			}
		});
	})
		.then( NotificationProvider.prototype.notify.bind( this ) );
};


export default NotificationProviderGrowl;
